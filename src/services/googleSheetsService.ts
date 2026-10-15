import { Classroom } from '../types';

export interface SheetRowData {
  rowNumber: number;
  seatCode: string;
  studentName: string;
  studentNumber: string;
  commentsByDate: Record<string, string[]>;
}

export interface SheetGridData {
  title: string;
  dates: string[];
  rows: SheetRowData[];
  classNotesByDate: Record<string, string[]>;
}

/**
 * Builds the tabular matrix according to the classroom seating layout:
 * - Rows for each seat (Col A: Sıra Kodu, Col B: Öğrenci Adı, Cols C, D...: Yorum Tarihleri)
 * - Final Row: "SINIF GENEL NOTLARI"
 * - Comments formatted as `[Öğrenci Adı]: Yorum metni...`
 */
export function buildClassroomSheetMatrix(classroom: Classroom): {
  dates: string[];
  values: string[][];
} {
  // Collect all unique dates from observations and class notes, sorted ascending
  const dateSet = new Set<string>();
  classroom.observations.forEach((obs) => {
    if (obs.date) dateSet.add(obs.date);
  });
  classroom.classNotes.forEach((cn) => {
    if (cn.date) dateSet.add(cn.date);
  });

  // Ensure current date is in the list
  const today = new Date().toISOString().split('T')[0];
  dateSet.add(today);

  const dates = Array.from(dateSet).sort();

  // Create rows matching total classroom seats (e.g. 24 seats)
  const totalSlots = classroom.seats.length > 0 ? classroom.seats.length : 24;
  const values: string[][] = [];

  for (let i = 0; i < totalSlots; i++) {
    const seat = classroom.seats[i];
    const student = seat?.studentId
      ? classroom.students.find((st) => st.id === seat.studentId)
      : classroom.students[i];

    const rowValues: string[] = [];

    if (student) {
      // Find current assigned seat for this student
      const assignedSeat = classroom.seats.find((s) => s.studentId === student.id);
      const seatCode = assignedSeat ? assignedSeat.code : (student.seatCode || `Sıra #${i + 1}`);
      rowValues.push(seatCode); // Col A: Sıra Kodu
      rowValues.push(`${student.fullName} (No: ${student.studentNumber})`); // Col B: Öğrenci Adı

      // For each date, collect comments
      dates.forEach((date) => {
        const obsList = classroom.observations.filter(
          (obs) => obs.studentId === student.id && obs.date === date
        );
        if (obsList.length > 0) {
          const formatted = obsList
            .map((obs) => `[${student.fullName}]: ${obs.content}`)
            .join(' \n');
          rowValues.push(formatted);
        } else {
          rowValues.push('');
        }
      });
    } else {
      // Empty slot placeholder
      const slotCode = seat ? seat.code : `Sıra #${i + 1}`;
      rowValues.push(`${slotCode} (Boş)`);
      rowValues.push('-');
      dates.forEach(() => rowValues.push(''));
    }

    values.push(rowValues);
  }

  // Row after students: Sınıf Genel Notları (Satır 24 veya son satır)
  const rowGeneralNotes: string[] = ['SINIF GENEL NOTLARI', 'Sınıf Geneli'];
  dates.forEach((date) => {
    const notesForDate = classroom.classNotes.filter((cn) => cn.date === date);
    if (notesForDate.length > 0) {
      const combined = notesForDate
        .map((cn) => `[Genel Not - ${cn.teacherName}]: ${cn.content}`)
        .join(' \n');
      rowGeneralNotes.push(combined);
    } else {
      rowGeneralNotes.push('');
    }
  });
  values.push(rowGeneralNotes);

  return { dates, values };
}

/**
 * Builds CSV string representation of the classroom matrix
 */
export function buildClassroomCSV(classroom: Classroom): string {
  const { dates, values } = buildClassroomSheetMatrix(classroom);
  const headerRow = ['Sıra Kodu (Yer)', 'Öğrenci Adı Soyadı', ...dates.map((d) => `Tarih: ${d}`)];
  const full = [headerRow, ...values];

  return full
    .map((row) =>
      row
        .map((cell) => `"${(cell || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`)
        .join(',')
    )
    .join('\r\n');
}

/**
 * Creates a new Google Spreadsheet on user's Google Drive:
 * Title: `Sinif_Oturma_Plani_[SinifAdi]`
 *
 * Uses dual-method strategy:
 * 1. Primary: Sheets API v4
 * 2. Fallback: Drive API v3 (in case Sheets API is disabled on project)
 */
export async function createGoogleSpreadsheet(
  accessToken: string,
  classroom: Classroom
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const sheetTitle = `Sinif_Oturma_Plani_${classroom.name.replace(/\s+/g, '_')}`;

  let spreadsheetId: string | null = null;
  let spreadsheetUrl: string | null = null;

  // Attempt 1: Try creating with Google Sheets API v4
  try {
    const requestBody = {
      properties: {
        title: sheetTitle,
      },
      sheets: [
        {
          properties: {
            title: 'Oturma_Plani',
            gridProperties: {
              rowCount: 35,
              columnCount: 15,
              frozenRowCount: 1,
              frozenColumnCount: 2,
            },
          },
        },
      ],
    };

    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      spreadsheetId = data.spreadsheetId;
      spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    } else {
      const errText = await response.text();
      console.warn('Sheets API v4 direct create not ok, trying Drive API v3 fallback:', errText);
    }
  } catch (sheetsErr) {
    console.warn('Sheets API v4 create failed, trying Drive API fallback:', sheetsErr);
  }

  // Attempt 2: Fallback to Google Drive API v3 if Sheets API failed
  if (!spreadsheetId) {
    try {
      const driveResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sheetTitle,
          mimeType: 'application/vnd.google-apps.spreadsheet',
          description: `${classroom.name} Sınıfı Oturma Planı ve Öğrenci Takip Çizelgesi`,
        }),
      });

      if (!driveResponse.ok) {
        const driveErr = await driveResponse.text();
        console.error('Drive API create error:', driveErr);
        throw new Error(`Google Drive üzerinde dosya oluşturulamadı: ${driveErr}`);
      }

      const driveData = await driveResponse.json();
      spreadsheetId = driveData.id;
      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    } catch (driveErr: any) {
      console.error('Drive API v3 create failed:', driveErr);
      throw new Error(`Google Drive bağlantı hatası: ${driveErr?.message || driveErr}`);
    }
  }

  if (!spreadsheetId || !spreadsheetUrl) {
    throw new Error('Google E-Tablo ID bilgisi alınamadı.');
  }

  // Synchronize initial data to the created spreadsheet
  try {
    await syncClassroomToGoogleSheet(accessToken, spreadsheetId, classroom);
  } catch (syncErr) {
    console.warn('Initial data sync warning:', syncErr);
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Synchronizes student seating and observations to the Google Spreadsheet
 */
export async function syncClassroomToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  classroom: Classroom
): Promise<{ rowCount: number; colCount: number }> {
  const { dates, values } = buildClassroomSheetMatrix(classroom);

  // Add header row at top so the sheet is crystal clear
  const headerRow = ['Sıra Kodu (Yer)', 'Öğrenci Adı Soyadı', ...dates.map((d) => `Tarih: ${d}`)];
  const fullMatrix = [headerRow, ...values];

  const colLetter = getColumnLetter(fullMatrix[0].length);
  const rowCount = fullMatrix.length;

  let syncSuccess = false;

  // Try Method 1: Google Sheets API v4 Values Update
  try {
    // Try first with sheet name 'Oturma_Plani'
    const range1 = `'Oturma_Plani'!A1:${colLetter}${rowCount}`;
    let updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        range1
      )}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: range1,
          majorDimension: 'ROWS',
          values: fullMatrix,
        }),
      }
    );

    // If 'Oturma_Plani' sheet tab not found (e.g. if created via Drive fallback with default 'Sheet1'), try Sheet1 or A1 directly
    if (!updateResponse.ok) {
      const range2 = `A1:${colLetter}${rowCount}`;
      updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
          range2
        )}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: range2,
            majorDimension: 'ROWS',
            values: fullMatrix,
          }),
        }
      );
    }

    if (updateResponse.ok) {
      syncSuccess = true;
      // Optional styling
      applySpreadsheetStyling(accessToken, spreadsheetId, fullMatrix.length).catch((e) =>
        console.warn('Styling note:', e)
      );
    } else {
      const errText = await updateResponse.text();
      console.warn('Sheets API v4 update not ok:', errText);
    }
  } catch (sheetsErr) {
    console.warn('Sheets API update error, will try CSV media upload fallback:', sheetsErr);
  }

  // Method 2 Fallback: If Sheets API v4 failed, upload formatted CSV to the Drive file
  if (!syncSuccess) {
    try {
      const csvData = buildClassroomCSV(classroom);
      const uploadResponse = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${spreadsheetId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'text/csv; charset=utf-8',
          },
          body: csvData,
        }
      );

      if (uploadResponse.ok) {
        syncSuccess = true;
      } else {
        const upErr = await uploadResponse.text();
        console.error('Drive media upload error:', upErr);
      }
    } catch (driveErr) {
      console.error('Drive media upload fallback error:', driveErr);
    }
  }

  return {
    rowCount: fullMatrix.length,
    colCount: fullMatrix[0].length,
  };
}

/**
 * Applies header styles to Google Sheets
 */
async function applySpreadsheetStyling(accessToken: string, spreadsheetId: string, totalRows: number) {
  try {
    const requests = [
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.12, green: 0.23, blue: 0.54 }, // Indigo dark
              textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
              horizontalAlignment: 'CENTER',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: totalRows - 1,
            endRowIndex: totalRows,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.95, green: 0.94, blue: 0.88 }, // Amber tint
              textFormat: { bold: true, italic: true },
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)',
        },
      },
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });
  } catch (err) {
    // Non-critical, ignore formatting failure
  }
}

function getColumnLetter(colIndex1Based: number): string {
  let letter = '';
  let temp = colIndex1Based;
  while (temp > 0) {
    let mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter || 'A';
}
