'use client';
import React, { useState } from 'react';
import {
  Play,
  Square,
  Pause,
  Plus,
  Download,
  Trash2,
} from 'lucide-react';
import SceneImporter from './SceneImporter';

const ShootingRecorder = () => {
  const [scenes, setScenes] = useState([]);
  
  const [records, setRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [selectedScene, setSelectedScene] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [newSceneCode, setNewSceneCode] = useState('');
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [showAddScene, setShowAddScene] = useState(false);

  const importScenes = (newScenes) => {
    if (!Array.isArray(newScenes) || newScenes.length === 0) return;
    setScenes((prev) => [
      ...prev,
      ...newScenes.map((s) => ({ id: Date.now() + Math.random(), ...s })),
    ]);
  };

  // 現在時刻を取得する関数
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 8); // HH:MM:SS形式
  };

  // 撮影開始
  const startRecording = () => {
    const sceneLabel = selectedScene || customInput;
    if (!sceneLabel) {
      alert('シーンを選択するか、カスタム入力を行ってください');
      return;
    }

    const startTime = getCurrentTime();
    const newRecord = {
      id: Date.now(),
      scene: sceneLabel,
      startTime: startTime,
      endTime: null,
      pausedDuration: 0,
      pauseStart: null,
      status: 'recording'
    };

    setCurrentRecord(newRecord);
    setIsRecording(true);
    setIsPaused(false);
  };

  // 一時停止
  const pauseRecording = () => {
    if (currentRecord) {
      setCurrentRecord({
        ...currentRecord,
        pauseStart: getCurrentTime()
      });
      setIsPaused(true);
    }
  };

  // 再開
  const resumeRecording = () => {
    if (currentRecord && currentRecord.pauseStart) {
      const pauseEnd = getCurrentTime();
      const pauseStart = new Date(`1970-01-01T${currentRecord.pauseStart}`);
      const pauseEndTime = new Date(`1970-01-01T${pauseEnd}`);
      const pauseDuration = (pauseEndTime - pauseStart) / 1000; // 秒単位

      setCurrentRecord({
        ...currentRecord,
        pausedDuration: currentRecord.pausedDuration + pauseDuration,
        pauseStart: null
      });
      setIsPaused(false);
    }
  };

  // 撮影終了
  const stopRecording = () => {
    if (currentRecord) {
      const endTime = getCurrentTime();
      const finalRecord = {
        ...currentRecord,
        endTime: endTime,
        status: 'completed'
      };

      setRecords([...records, finalRecord]);
      setCurrentRecord(null);
      setIsRecording(false);
      setIsPaused(false);
      setSelectedScene('');
      setCustomInput('');
    }
  };

  // 新しいシーンを追加
  const addNewScene = () => {
    if (newSceneCode && newSceneTitle) {
      const newScene = {
        id: Date.now(),
        code: newSceneCode,
        title: newSceneTitle
      };
      setScenes([...scenes, newScene]);
      setNewSceneCode('');
      setNewSceneTitle('');
      setShowAddScene(false);
    }
  };

  // CSVダウンロード
  const downloadCSV = () => {
    if (records.length === 0) {
      alert('記録がありません');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const csvContent = [
      ['日付', 'シーン', '開始時刻', '終了時刻', '備考'].join(','),
      ...records.map(record => {
        const remarks = record.pausedDuration > 0 ? '中断あり' : '';
        return [
          today,
          record.scene,
          record.startTime,
          record.endTime,
          remarks
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `撮影記録_${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 記録を削除
  const deleteRecord = (id) => {
    setRecords(records.filter(record => record.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">撮影記録管理</h1>
        
        {/* シーン選択・入力エリア */}
        <div className="mb-6">
          <SceneImporter onScenesImported={importScenes} />
          <h2 className="text-xl font-semibold mb-4">シーン選択</h2>
          
          {/* 登録済みシーン */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              登録済みシーン
            </label>
            <select 
              value={selectedScene} 
              onChange={(e) => {
                setSelectedScene(e.target.value);
                setCustomInput('');
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isRecording}
            >
              <option value="">シーンを選択してください</option>
              {scenes.map(scene => (
                <option key={scene.id} value={`${scene.code}-${scene.title}`}>
                  {scene.code} - {scene.title}
                </option>
              ))}
            </select>
          </div>

          {/* カスタム入力 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カスタム入力
            </label>
            <input
              type="text"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                setSelectedScene('');
              }}
              placeholder="例: サムネイル撮影, 昼休憩"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isRecording}
            />
          </div>

          {/* シーン追加ボタン */}
          <button
            onClick={() => setShowAddScene(!showAddScene)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            disabled={isRecording}
          >
            <Plus size={16} />
            新しいシーンを追加
          </button>

          {/* シーン追加フォーム */}
          {showAddScene && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={newSceneCode}
                  onChange={(e) => setNewSceneCode(e.target.value)}
                  placeholder="シーンコード (s04)"
                  className="p-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={newSceneTitle}
                  onChange={(e) => setNewSceneTitle(e.target.value)}
                  placeholder="シーンタイトル"
                  className="p-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={addNewScene}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                追加
              </button>
            </div>
          )}
        </div>

        {/* 撮影コントロール */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">撮影コントロール</h2>
          
          {/* 現在の撮影状況 */}
          {currentRecord && (
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <p className="text-lg font-medium text-blue-800">
                撮影中: {currentRecord.scene}
              </p>
              <p className="text-sm text-blue-600">
                開始時刻: {currentRecord.startTime}
                {isPaused && <span className="text-orange-600 ml-2">(一時停止中)</span>}
              </p>
            </div>
          )}

          {/* コントロールボタン */}
          <div className="flex gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-lg"
              >
                <Play size={20} />
                撮影開始
              </button>
            ) : (
              <div className="flex gap-4">
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    <Pause size={20} />
                    一時停止
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    <Play size={20} />
                    再開
                  </button>
                )}
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Square size={20} />
                  撮影終了
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 撮影記録一覧 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">撮影記録</h2>
            {records.length > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Download size={16} />
                CSV出力
              </button>
            )}
          </div>

          {records.length === 0 ? (
            <p className="text-gray-500 text-center py-8">まだ記録がありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">シーン</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">開始時刻</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">終了時刻</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">備考</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{record.scene}</td>
                      <td className="border border-gray-300 px-4 py-2">{record.startTime}</td>
                      <td className="border border-gray-300 px-4 py-2">{record.endTime}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.pausedDuration > 0 && (
                          <span className="text-orange-600">中断あり</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="削除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShootingRecorder;