import type { Member } from '../types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function genderLabel(gender: Member['gender']) {
  return gender === 'nam' ? 'Nam' : gender === 'nu' ? 'Nữ' : 'Khác';
}

function memberTypeLabel(memberType: Member['memberType']) {
  return memberType === 'doan_vien' ? 'Đoàn viên' : 'Đảng viên sinh hoạt đoàn';
}

function escapeCsvField(value: string) {
  if (/[";\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const HEADERS = [
  'STT',
  'Họ và tên',
  'Ngày sinh',
  'Giới tính',
  'Chi đoàn',
  'Bộ phận công tác',
  'Ngày vào Đoàn',
  'Phân loại',
  'Chức vụ',
  'Số điện thoại',
  'Email',
  'Ghi chú',
];

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: { description: string; accept: Record<string, string[]> }[];
}

interface FileSystemWritableStream {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

interface FileSystemFileHandleLike {
  createWritable(): Promise<FileSystemWritableStream>;
}

type WindowWithSavePicker = Window & {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandleLike>;
};

function downloadViaAnchor(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportMembersToExcel(members: Member[]) {
  const rows = members.map((m, idx) => [
    String(idx + 1),
    m.fullName,
    formatDate(m.dateOfBirth),
    genderLabel(m.gender),
    m.chapterName ?? '-',
    m.departmentName ?? '-',
    formatDate(m.joinDate),
    memberTypeLabel(m.memberType),
    m.roleTitleName ?? '-',
    m.phone ?? '',
    m.email ?? '',
    m.notes ?? '',
  ]);

  // Dùng ";" làm dấu phân cách vì Excel bản tiếng Việt (Windows vi-VN) mặc định
  // coi "," là dấu thập phân nên tự động dùng ";" làm ký tự ngăn cách cột CSV.
  const lines = [HEADERS, ...rows].map((cols) => cols.map(escapeCsvField).join(';'));
  const csvContent = '﻿' + lines.join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `danh-sach-doan-vien-${date}.csv`;

  // showSaveFilePicker (Chrome/Edge) mở hộp thoại "Lưu tại" cho người dùng chọn nơi lưu.
  // Trình duyệt không hỗ trợ (Firefox/Safari) sẽ rơi về tải file mặc định qua thẻ <a>.
  const win = window as WindowWithSavePicker;
  if (win.showSaveFilePicker) {
    try {
      const handle = await win.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'CSV', accept: { 'text/csv': ['.csv'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // Người dùng bấm Hủy trong hộp thoại lưu file
      }
      // Lỗi khác (vd trình duyệt chặn do mất user activation) -> rơi về tải mặc định
    }
  }

  downloadViaAnchor(blob, fileName);
}
