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
 * Builds the tabular matrix according to the business rules:
 * - Rows 1..23: Student Seat Code (Col A), Student Name (Col B), Date Comments (Cols C, D, E...)
 * - Row 24: Class General Notes ("SINIF GENEL NOTLARI" in Col A, notes by date in Cols C, D, E...)
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

  // Create 24 rows
  // Row 1 to 23 for students (up to 23 capacity)
  // Row 24 for General Class Notes
  const values: string[][] = [];

  // Header row (Row 1): Sıra Kodu | Öğrenci Adı | Tarih 1 | Tarih 2 ...
  // To strictly align with user's row 1..23 student list + row 24 general notes:
  // We can populate rows for students (indices 0..22 -> Rows 1..23)
  for (let i = 0; i < 23; i++) {
    const student = classroom.students[i];
    const rowValues: string[] = [];

    if (student) {
      // Find current seat code
      const seat = classroom.seats.find((s) => s.studentId === student.id);
      const seatCode = seat ? seat.code : (student.seatCode || 'Atanmadı');
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
      rowValues.push(`Sıra #${i + 1} (Boş)`);
      rowValues.push('-');
      dates.forEach(() => rowValues.push(''));
    }

    values.push(rowValues);
  }

  // Row 24: Sınıf Genel Notları
  const row24Values: string[] = ['SINIF GENEL NOTLARI', 'Sınıf Geneli'];
  dates.forEach((date) => {
    const notesForDate = classroom.classNotes.filter((cn) => cn.date === date);
    if (notesForDate.length > 0) {
      const combined = notesForDate
        .map((cn) => `[Genel Not - ${cn.teacherName}]: ${cn.content}`)
        .join(' \n');
      row24Values.push(combined);
    } else {
      row24Values.push('');
    }
  });
  values.push(row24Values);

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
          title: 'Oturma Planı ve Takip',
          gridProperties: {
            rowCount: 30,
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
    throw new Error(`Google E-Tablo oluşturulamadı: ${errText}`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Synchronize initial data
  await syncClassroomToGoogleSheet(accessToken, spreadsheetId, classroom);

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

  // Update sheet with full matrix
  const range = `Oturma Planı ve Takip!A1:${getColumnLetter(fullMatrix[0].length)}${fullMatrix.length}`;

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
    throw new Error(`Google E-Tablo güncellemesi başarısız: ${errText}`);
  }

  // Format header row and Row 24 (General Notes) for professional look
  try {
    await applySpreadsheetStyling(accessToken, spreadsheetId);
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
async function applySpreadsheetStyling(accessToken: string, spreadsheetId: string) {
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
          startRowIndex: 24, // Row 25 in 1-based (Row 24 general notes)
          endRowIndex: 25,
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
