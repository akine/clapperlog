'use client';
import React, { useState } from 'react';
import {
  Play,
  Square,
  Pause,
  Plus,
  Download,
  Trash2,
  Camera,
  Clock
} from 'lucide-react';

const ShootingRecorder = () => {
  const [scenes, setScenes] = useState([
    { id: 1, label: 'サムネイル撮影' },
    { id: 2, label: 'モノローグ' }
  ]);

  const [records, setRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [selectedScene, setSelectedScene] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [newSceneEnd, setNewSceneEnd] = useState('s01');
  const [showAddScene, setShowAddScene] = useState(false);
  const [customSceneName, setCustomSceneName] = useState('');
  const [addMode, setAddMode] = useState('range'); // 'range' or 'custom'

  // 現在時刻を取得する関数
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 8); // HH:MM:SS形式
  };

  // 撮影開始
  const startRecording = () => {
    if (!selectedScene) {
      alert('シーンを選択してください');
      return;
    }

    const startTime = getCurrentTime();
    const newRecord = {
      id: Date.now(),
      scene: selectedScene,
      startTime: startTime,
      endTime: null,
      pausedDuration: 0,
      pauseStart: null,
      status: 'recording'
    };

    setCurrentRecord(newRecord);
    setIsRecording(true);
    setIsPaused(false);
    
    // 撮影開始後にシーンを削除
    setScenes(prev => prev.filter(s => s.label !== selectedScene));
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

  // 撮影時間を計算する関数
  const calculateDuration = (startTime, endTime, pausedDuration = 0) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const totalSeconds = Math.floor((end - start) / 1000) - pausedDuration;
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}分${seconds}秒`;
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

      // 撮影時間を計算して表示
      const duration = calculateDuration(finalRecord.startTime, finalRecord.endTime, finalRecord.pausedDuration);
      alert(`撮影完了！\nシーン: ${finalRecord.scene}\n撮影時間: ${duration}`);

      setRecords(prevRecords => {
        console.log('Adding record:', finalRecord); // デバッグ用
        console.log('Previous records:', prevRecords); // デバッグ用
        return [...prevRecords, finalRecord];
      });
      setCurrentRecord(null);
      setIsRecording(false);
      setIsPaused(false);
      setSelectedScene('');
    }
  };

  // 新しいシーンを追加
  const addNewScene = () => {
    if (addMode === 'range') {
      const start = 1; // s01で固定
      const end = parseInt(newSceneEnd.replace('s', ''), 10);
      const newScenes = [];
      for (let i = start; i <= end; i++) {
        newScenes.push({
          id: Date.now() + Math.random(),
          label: `s${String(i).padStart(2, '0')}`,
        });
      }
      setScenes([...scenes, ...newScenes]);
      setNewSceneEnd('s01');
    } else {
      // カスタムシーン追加
      if (customSceneName.trim()) {
        const newScene = {
          id: Date.now() + Math.random(),
          label: customSceneName.trim(),
        };
        setScenes([...scenes, newScene]);
        setCustomSceneName('');
      } else {
        alert('シーン名を入力してください');
        return;
      }
    }
    setShowAddScene(false);
  };

  // CSVダウンロード
  const downloadCSV = () => {
    if (records.length === 0) {
      alert('記録がありません');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const csvContent = [
      ['日付', 'シーン', '開始時刻', '終了時刻', '撮影時間', '備考'].join(','),
      ...records.map(record => {
        const remarks = record.pausedDuration > 0 ? '中断あり' : '';
        const duration = calculateDuration(record.startTime, record.endTime, record.pausedDuration);
        return [
          today,
          record.scene,
          record.startTime,
          record.endTime,
          duration,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              撮影記録管理
            </h1>
          </div>
          <p className="text-slate-400 text-lg">プロフェッショナルな撮影管理システム</p>
        </div>

        <div className="grid gap-6 lg:gap-8">
          {/* シーン選択エリア */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              シーン選択
            </h2>
            
            <div className="space-y-6">
              {/* 登録済みシーン */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  登録済みシーン
                </label>
                <select
                  value={selectedScene}
                  onChange={(e) => setSelectedScene(e.target.value)}
                  className="w-full p-4 bg-white/10 backdrop-blur border border-white/30 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                  disabled={isRecording}
                >
                  <option value="" className="bg-slate-800 text-white">シーンを選択してください</option>
                  {scenes.map(scene => (
                    <option key={scene.id} value={scene.label} className="bg-slate-800 text-white">
                      {scene.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* シーン追加ボタン */}
              <button
                onClick={() => setShowAddScene(!showAddScene)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                disabled={isRecording}
              >
                <Plus size={20} />
                新しいシーンを追加
              </button>

              {/* シーン追加フォーム */}
              {showAddScene && (
                <div className="bg-gradient-to-r from-blue-50/10 to-purple-50/10 backdrop-blur rounded-xl p-6 border border-white/20">
                  {/* モード選択タブ */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setAddMode('range')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        addMode === 'range'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      連番追加
                    </button>
                    <button
                      onClick={() => setAddMode('custom')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        addMode === 'custom'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      カスタム追加
                    </button>
                  </div>

                  {addMode === 'range' ? (
                    <div>
                      <div className="flex gap-3 mb-4 items-center">
                        <div className="flex-1 p-3 bg-white/5 backdrop-blur border border-white/20 rounded-lg text-slate-300 flex items-center">
                          s01
                        </div>
                        <span className="text-white font-bold text-lg">〜</span>
                        <select
                          value={newSceneEnd}
                          onChange={(e) => setNewSceneEnd(e.target.value)}
                          className="flex-1 p-3 bg-white/10 backdrop-blur border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        >
                          {Array.from({ length: 99 }, (_, i) => `s${String(i + 1).padStart(2, '0')}`).map(code => (
                            <option key={code} value={code} className="bg-slate-800 text-white">{code}</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-slate-400 text-sm mb-4">s01からs{newSceneEnd.slice(1)}まで連続して追加されます</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">
                        カスタムシーン名
                      </label>
                      <input
                        type="text"
                        value={customSceneName}
                        onChange={(e) => setCustomSceneName(e.target.value)}
                        placeholder="例: 緊急リテイク, 追加カット, インサート撮影"
                        className="w-full p-3 bg-white/10 backdrop-blur border border-white/30 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                        onKeyPress={(e) => e.key === 'Enter' && addNewScene()}
                      />
                      <p className="text-slate-400 text-sm mt-2">現場での急なシーン変更に対応できます</p>
                    </div>
                  )}

                  <button
                    onClick={addNewScene}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg font-semibold"
                  >
                    {addMode === 'range' ? '連番追加' : 'カスタム追加'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 撮影コントロール */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-pink-400 rounded-full"></div>
              撮影コントロール
            </h2>
            
            {/* 現在の撮影状況 */}
            {currentRecord && (
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur rounded-xl p-6 mb-6 border border-blue-400/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-orange-400 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                  <p className="text-xl font-bold text-white">
                    撮影中: {currentRecord.scene}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock size={16} />
                  <p>開始時刻: {currentRecord.startTime}</p>
                  {isPaused && <span className="text-orange-400 font-semibold ml-2">(一時停止中)</span>}
                </div>
              </div>
            )}

            {/* コントロールボタン */}
            <div className="flex flex-wrap gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Play size={24} />
                  撮影開始
                </button>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {!isPaused ? (
                    <button
                      onClick={pauseRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Pause size={20} />
                      一時停止
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Play size={20} />
                      再開
                    </button>
                  )}
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Square size={20} />
                    撮影終了
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 撮影記録一覧 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"></div>
                撮影記録
              </h2>
              {records.length > 0 && (
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Download size={18} />
                  CSV出力
                </button>
              )}
            </div>

            {records.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-400 text-lg">まだ記録がありません</p>
                <p className="text-slate-500 text-sm mt-2">撮影を開始して記録を作成しましょう</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid grid-cols-1 gap-4 sm:hidden">
                    {/* モバイル表示 */}
                    {records.map(record => (
                      <div key={record.id} className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white text-lg">{record.scene}</h3>
                          <button
                            onClick={() => deleteRecord(record.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                            title="削除"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="space-y-1 text-slate-300">
                          <p><span className="text-slate-400">開始:</span> {record.startTime}</p>
                          <p><span className="text-slate-400">終了:</span> {record.endTime}</p>
                          <p><span className="text-slate-400">撮影時間:</span> {calculateDuration(record.startTime, record.endTime, record.pausedDuration)}</p>
                          {record.pausedDuration > 0 && (
                            <p className="text-orange-400 font-semibold">中断あり</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* デスクトップ表示 */}
                  <table className="w-full hidden sm:table">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">シーン</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">開始時刻</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">終了時刻</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">撮影時間</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">備考</th>
                        <th className="text-left py-4 px-4 text-slate-300 font-semibold">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map(record => (
                        <tr key={record.id} className="border-b border-white/10 hover:bg-white/5 transition-all duration-200">
                          <td className="py-4 px-4 text-white font-semibold">{record.scene}</td>
                          <td className="py-4 px-4 text-slate-300">{record.startTime}</td>
                          <td className="py-4 px-4 text-slate-300">{record.endTime}</td>
                          <td className="py-4 px-4 text-emerald-400 font-semibold">{calculateDuration(record.startTime, record.endTime, record.pausedDuration)}</td>
                          <td className="py-4 px-4">
                            {record.pausedDuration > 0 && (
                              <span className="text-orange-400 font-semibold">中断あり</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => deleteRecord(record.id)}
                              className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                              title="削除"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShootingRecorder;