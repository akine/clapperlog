'use client';
import React, { useState } from 'react';
import { FileUp, Upload } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const SceneImporter = ({ onScenesImported }) => {
  const [textInput, setTextInput] = useState('');
  const [fileError, setFileError] = useState('');

  const parseLines = (raw) => {
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const m = line.match(/^s?(\d{2})\s*[-ー]?\s*(.+)$/i);
        if (!m) return null;
        return { code: `s${m[1]}`, title: m[2] };
      })
      .filter(Boolean);
  };

  const handleScenes = (scenes) => {
    if (scenes.length > 0) {
      onScenesImported(scenes);
      setTextInput('');
    }
  };

  const handleTextImport = () => {
    const scenes = parseLines(textInput);
    handleScenes(scenes);
  };

  const handleCSVImport = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const scenes = parseLines(reader.result);
      handleScenes(scenes);
    };
    reader.readAsText(file, 'utf-8');
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join('\n');
    }
    return text;
  };

  const handlePDFImport = async (file) => {
    try {
      const text = await extractTextFromPDF(file);
      const scenes = parseLines(text);
      handleScenes(scenes);
    } catch (e) {
      setFileError('PDF解析に失敗しました');
    }
  };

  const onFileChange = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (!file) return;
    if (file.type === 'application/pdf') {
      handlePDFImport(file);
    } else if (file.type === 'text/csv') {
      handleCSVImport(file);
    } else {
      setFileError('PDFまたはCSVファイルを選択してください');
    }
    e.target.value = '';
  };

  return (
    <div className="p-4 bg-gray-50 rounded-md mb-6">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <FileUp size={16} /> 香盤表インポート
      </h3>
      <input
        type="file"
        accept=".pdf,.csv"
        onChange={onFileChange}
        className="mb-3"
      />
      {fileError && <p className="text-red-600 text-sm mb-2">{fileError}</p>}
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="テキストを貼り付け"
        className="w-full p-2 border border-gray-300 rounded-md mb-2 h-24"
      />
      <button
        onClick={handleTextImport}
        className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md"
      >
        <Upload size={14} /> 登録
      </button>
    </div>
  );
};

export default SceneImporter;
