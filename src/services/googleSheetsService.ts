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
  const totalSlots = Math.max(classroom.seats.length, 24);
  const values: string[][] = [];

  for (let i = 0; i < totalSlots; i++) {
    const student = classroom.students[i];
    const seat = classroom.seats[i];
    const rowValues: string[] = [];

    if (student) {
      // Find current assigned seat for this student
      const assignedSeat = classroom.seats.find((s) => s.studentId === student.id);
      const seatCode = assignedSeat ? assignedSeat.code : (student.seatCode || `Sıra #${i + 1}`);
      rowValues.push(seatCode); // Col A
      rowValues.push(`${student.fullName} (${student.studentNumber})`); // Col B

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

  // Row after students: Sınıf Genel Notları
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
 * Creates a new Google Spreadsheet on user's Google Drive:
 * Title: `Sinif_Oturma_Plani_[SinifAdi]`
 */
export async function createGoogleSpreadsheet(
  accessToken: string,
  classroom: Classroom
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const sheetTitle = `Sinif_Oturma_Plani_${classroom.name.replace(/\s+/g, '_')}`;

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

  if (!response.ok) {
    const errText = await response.text();
    console.error('Google Sheets API Error on create:', errText);
    throw new Error(`Google E-Tablo oluşturulamadı: ${errText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Synchronize initial data
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
  // Use escaped single quotes around sheet title to strictly follow Sheets API range specification
  const range = `'Oturma_Plani'!A1:${colLetter}${rowCount}`;

  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: fullMatrix,
      }),
    }
  );

  if (!updateResponse.ok) {
    const errText = await updateResponse.text();
    console.error('Google Sheets API update error:', errText);
    throw new Error(`Google E-Tablo güncellemesi başarısız: ${errText}`);
  }

  // Format header row and General Notes for professional look
  try {
    await applySpreadsheetStyling(accessToken, spreadsheetId, fullMatrix.length);
  } catch (styleErr) {
    console.warn('Formatting could not be applied, but data was synced:', styleErr);
  }

  return {
    rowCount: fullMatrix.length,
    colCount: fullMatrix[0].length,
  };
}

/**
 * Applies elegant header styles to Google Sheets
 */
async function applySpreadsheetStyling(accessToken: string, spreadsheetId: string, totalRows: number) {
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
