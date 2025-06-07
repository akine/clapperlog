'use client';
import React, { useState } from 'react';
import { FileUp, Upload } from 'lucide-react';

const SceneImporter = ({ onScenesImported }) => {
  const [textInput, setTextInput] = useState('');
  const [fileError, setFileError] = useState('');

  const parseLines = (raw) => {
    const results = [];
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const rangeMatch = line.match(/^s?(\d{2})~s?(\d{2})\s*[-ー]?\s*(.+)$/i);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1], 10);
          const end = parseInt(rangeMatch[2], 10);
          const title = rangeMatch[3];
          for (let i = start; i <= end; i++) {
            results.push({ code: `s${String(i).padStart(2, '0')}`, title });
          }
          return;
        }
        const m = line.match(/^s?(\d{2})\s*[-ー]?\s*(.+)$/i);
        if (m) {
          results.push({ code: `s${m[1]}`, title: m[2] });
        }
      });
    return results;
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

  const onFileChange = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (!file) return;
    if (file.type === 'text/csv') {
      handleCSVImport(file);
    } else {
      setFileError('CSVファイルを選択してください');
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
        accept=".csv"
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
