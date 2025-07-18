import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient.js'
import AuthForm from '@/components/auth/AuthForm.jsx'
import {
  Play,
  Pause,
  Square,
  Plus,
  Download,
  Trash2,
  Pencil,
  Clock,
  Camera,
  MoreVertical,
  RotateCw,
} from 'lucide-react'
import { useLocalStorageBatch } from '@/hooks/useLocalStorageBatch.js'
import { Button } from '@/components/ui/button.jsx'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu.jsx'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog.jsx'
import './App.css'

const APP_VERSION = __APP_VERSION__

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])
  // 状態管理
  // 撮影日の管理
  const [shootingDates, setShootingDates] = useState([])

  useEffect(() => {
    if (!session) return
    const fetchDates = async () => {
      const { data, error } = await supabase
        .from('shooting_dates')
        .select('id, date, title')
        .eq('user_id', session.user.id)
        .order('date')
      if (!error && data) {
        setShootingDates(data.map(d => ({ id: d.id, date: d.date, title: d.title })))
      }
    }
    fetchDates()
  }, [session])
  const [activeDate, setActiveDate] = useState(() => {
    const saved = localStorage.getItem('shooting-app-active-date')
    return saved || null
  })
  const [newDate, setNewDate] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editTitle, setEditTitle] = useState('')

  const prefix = (key) => `shooting-app-${activeDate}-${key}`
  const datePrefix = (date, key) => `shooting-app-${date}-${key}`
  const activeTitle = shootingDates.find(d => d.date === activeDate)?.title || ''

  const [scenes, setScenes] = useState(() => {
    return []
  })
  const [records, setRecords] = useState(() => {
    return []
  })
  const [currentRecord, setCurrentRecord] = useState(() => {
    return null
  })
  const [selectedScene, setSelectedScene] = useState(() => {
    return ''
  })
  const [isRecording, setIsRecording] = useState(() => {
    return false
  })
  const [isPaused, setIsPaused] = useState(() => {
    return false
  })
  const [isSettingUp, setIsSettingUp] = useState(() => {
    return false
  })
  const [setupStartTime, setSetupStartTime] = useState(() => {
    return null
  })
  const [showAddScene, setShowAddScene] = useState(false)
  const [addMode, setAddMode] = useState('range')
  const [newSceneEnd, setNewSceneEnd] = useState('')
  const [customSceneName, setCustomSceneName] = useState('')
  const [thumbnailSelected, setThumbnailSelected] = useState(false)
  const [monologueSelected, setMonologueSelected] = useState(false)
  const [monologueName, setMonologueName] = useState('')
  const [creditTaps, setCreditTaps] = useState(0)
  const [showHearts, setShowHearts] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  // 選択された撮影日のデータを読み込み
  useEffect(() => {
    if (!activeDate) return
    const load = (key) => {
      const val = localStorage.getItem(prefix(key))
      return val ? JSON.parse(val) : []
    }

    setScenes(load('scenes'))
    setRecords(load('records'))
    const current = localStorage.getItem(prefix('current-record'))
    setCurrentRecord(current ? JSON.parse(current) : null)
    setSelectedScene(localStorage.getItem(prefix('selected-scene')) || '')
    setIsRecording(localStorage.getItem(prefix('is-recording')) === 'true')
    setIsPaused(localStorage.getItem(prefix('is-paused')) === 'true')
    setIsSettingUp(localStorage.getItem(prefix('is-setting-up')) === 'true')
    const setup = localStorage.getItem(prefix('setup-start-time'))
    setSetupStartTime(setup ? Number(setup) : null)
  }, [activeDate])

  // ローカルストレージへの保存（バッチ処理で最適化）
  const storageData = {
    'shooting-app-dates': shootingDates,
    'shooting-app-active-date': activeDate,
  }
  if (activeDate) {
    storageData[prefix('scenes')] = scenes
    storageData[prefix('records')] = records
    storageData[prefix('current-record')] = currentRecord
    storageData[prefix('selected-scene')] = selectedScene
    storageData[prefix('is-recording')] = isRecording.toString()
    storageData[prefix('is-paused')] = isPaused.toString()
    storageData[prefix('is-setting-up')] = isSettingUp.toString()
    storageData[prefix('setup-start-time')] =
      setupStartTime !== null ? setupStartTime.toString() : null
  }
  useLocalStorageBatch(storageData)

  // シーン追加機能
  const addRangeScenes = () => {
    if (!newSceneEnd || newSceneEnd < 1 || newSceneEnd > 99) return
    
    const newScenes = []
    for (let i = 1; i <= parseInt(newSceneEnd); i++) {
      const sceneNumber = i.toString().padStart(2, '0')
      newScenes.push(`s${sceneNumber}`)
    }
    
    setScenes(prev => [...prev, ...newScenes])
    setNewSceneEnd('')
    setShowAddScene(false)
  }

  const addCustomScene = () => {
    if (!customSceneName.trim()) return

    setScenes(prev => [...prev, customSceneName.trim()])
    setCustomSceneName('')
    setShowAddScene(false)
  }

  const toggleThumbnail = () => {
    setThumbnailSelected(prev => {
      const next = !prev
      setScenes(scenes => {
        if (next) {
          return scenes.includes('サムネイル') ? scenes : [...scenes, 'サムネイル']
        }
        return scenes.filter(scene => scene !== 'サムネイル')
      })
      return next
    })
  }

  const toggleMonologue = () => {
    const sceneName = monologueName.trim()
      ? `${monologueName.trim()} - モノローグ`
      : 'モノローグ'

    setMonologueSelected(prev => {
      const next = !prev
      setScenes(scenes => {
        // remove any previous monologue scenes
        const filtered = scenes.filter(scene => !scene.endsWith(' - モノローグ') && scene !== 'モノローグ')
        if (next) {
          return [...filtered, sceneName]
        }
        return filtered
      })
      return next
    })
  }

  useEffect(() => {
    if (monologueSelected) {
      const sceneName = monologueName.trim()
        ? `${monologueName.trim()} - モノローグ`
        : 'モノローグ'
      setScenes(scenes => {
        const filtered = scenes.filter(scene => !scene.endsWith(' - モノローグ') && scene !== 'モノローグ')
        return [...filtered, sceneName]
      })
    }
  }, [monologueName])

  // 撮影記録機能
  const startSetup = () => {
    if (!selectedScene || isSettingUp || isRecording) return
    setIsSettingUp(true)
    setSetupStartTime(Date.now())
  }

  const startRecording = () => {
    if (!selectedScene) return

    const now = new Date()
    const startTime = now.toLocaleTimeString('ja-JP', { hour12: false })
    const setupDurationMs = setupStartTime ? now.getTime() - setupStartTime : 0

    setCurrentRecord({
      scene: selectedScene,
      startTime: startTime,
      startTimestamp: now.getTime(),
      pausedDuration: 0,
      pauseStartTime: null,
      hasPauses: false,
      setupDuration: formatDuration(setupDurationMs)
    })

    setIsSettingUp(false)
    setSetupStartTime(null)
    setIsRecording(true)
    setIsPaused(false)
    
    // 使用したシーンを選択肢から削除
    setScenes(prev => prev.filter(scene => scene !== selectedScene))
    // selectedSceneはクリアしない（現在の状況表示のため）
  }

  const pauseRecording = () => {
    if (!isRecording || isPaused) return
    
    setCurrentRecord(prev => ({
      ...prev,
      pauseStartTime: Date.now(),
      hasPauses: true
    }))
    setIsPaused(true)
  }

  const resumeRecording = () => {
    if (!isRecording || !isPaused) return
    
    setCurrentRecord(prev => {
      const pauseDuration = Date.now() - prev.pauseStartTime
      return {
        ...prev,
        pausedDuration: prev.pausedDuration + pauseDuration,
        pauseStartTime: null
      }
    })
    setIsPaused(false)
  }

  const stopRecording = () => {
    if (!isRecording) return
    
    const now = new Date()
    const endTime = now.toLocaleTimeString('ja-JP', { hour12: false })
    
    let totalPausedDuration = currentRecord.pausedDuration
    if (isPaused && currentRecord.pauseStartTime) {
      totalPausedDuration += Date.now() - currentRecord.pauseStartTime
    }
    
    const actualRecordingTime = now.getTime() - currentRecord.startTimestamp - totalPausedDuration
    const duration = formatDuration(actualRecordingTime)
    
    const newRecord = {
      scene: currentRecord.scene,
      startTime: currentRecord.startTime,
      endTime: endTime,
      duration: duration,
      setupDuration: currentRecord.setupDuration,
      notes: currentRecord.hasPauses ? '中断あり' : '',
      timestamp: now.getTime()
    }
    
    setRecords(prev => [...prev, newRecord])
    setCurrentRecord(null)
    setIsRecording(false)
    setIsPaused(false)
    setIsSettingUp(false)
    setSetupStartTime(null)
    setSelectedScene('')
  }

  // 時間フォーマット関数
  const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // 現在の撮影時間を計算
  const getCurrentDuration = () => {
    if (!currentRecord) return '00:00:00'
    
    const now = Date.now()
    let totalPausedDuration = currentRecord.pausedDuration
    
    if (isPaused && currentRecord.pauseStartTime) {
      totalPausedDuration += now - currentRecord.pauseStartTime
    }
    
    const actualRecordingTime = now - currentRecord.startTimestamp - totalPausedDuration
    return formatDuration(Math.max(0, actualRecordingTime))
  }

  const getSetupDuration = () => {
    if (!isSettingUp || setupStartTime === null) return '00:00:00'
    const now = Date.now()
    return formatDuration(now - setupStartTime)
  }

  // リアルタイム更新のためのuseEffect
  const [, setCurrentTime] = useState(Date.now())
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRecording || isSettingUp) {
        setCurrentTime(Date.now())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording, isSettingUp])

  // ページ読み込み時の撮影状態復元
  useEffect(() => {
    if ((isRecording && currentRecord) || isSettingUp) {
      // 撮影中または段取り中の状態でページがリロードされた場合、タイマーを再開
      setCurrentTime(Date.now())
    }
  }, [])

  // 記録削除機能
  const deleteRecord = (index) => {
    setRecords(prev => prev.filter((_, i) => i !== index))
  }

  // CSV出力機能
  const exportToCSV = () => {
    if (records.length === 0) return
    
    const today = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-')
    
    const headers = ['日付', 'シーン', '開始時刻', '終了時刻', '撮影時間', '段取り時間', '備考']
    const csvData = records.map(record => [
      today,
      record.scene,
      record.startTime,
      record.endTime,
      record.duration,
      record.setupDuration,
      record.notes
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `撮影記録_${today}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCreditTap = () => {
    setCreditTaps(prev => {
      const next = prev + 1
      if (next >= 5) {
        setShowHearts(true)
        setTimeout(() => setShowHearts(false), 1500)
        return 0
      }
      return next
    })
  }

  const addDate = async () => {
    if (!newDate) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selected = new Date(newDate)
    if (selected < today) {
      alert('過去の日付は登録できません')
      return
    }
    if (!shootingDates.some(d => d.date === newDate)) {
      const { data, error } = await supabase
        .from('shooting_dates')
        .insert({ user_id: session.user.id, date: newDate, title: newTitle.trim() })
        .select()
        .single()
      if (!error && data) {
        setShootingDates(prev => [
          ...prev,
          { id: data.id, date: data.date, title: data.title }
        ])
      }
    }
    setNewDate('')
    setNewTitle('')
  }

  const startEditDate = (index) => {
    const item = shootingDates[index]
    setEditDate(item.date)
    setEditTitle(item.title)
    setEditingIndex(index)
  }

  const cancelEditDate = () => {
    setEditingIndex(null)
    setEditDate('')
    setEditTitle('')
  }

  const moveStorage = (oldDate, newDate) => {
    const keys = [
      'scenes',
      'records',
      'current-record',
      'selected-scene',
      'is-recording',
      'is-paused',
      'is-setting-up',
      'setup-start-time',
    ]
    keys.forEach((k) => {
      const oldKey = datePrefix(oldDate, k)
      const val = localStorage.getItem(oldKey)
      if (val !== null) {
        localStorage.setItem(datePrefix(newDate, k), val)
        localStorage.removeItem(oldKey)
      }
    })
  }

  const saveEditDate = async () => {
    if (editingIndex === null) return
    const oldItem = shootingDates[editingIndex]
    const updated = { date: editDate, title: editTitle.trim() }
    const { error } = await supabase
      .from('shooting_dates')
      .update(updated)
      .eq('id', oldItem.id)
    if (!error) {
      setShootingDates(prev => {
        const copy = [...prev]
        copy[editingIndex] = { ...oldItem, ...updated }
        return copy
      })
    }

    if (oldItem.date !== editDate) {
      moveStorage(oldItem.date, editDate)
      if (activeDate === oldItem.date) {
        setActiveDate(editDate)
      }
    }

    cancelEditDate()
  }

  const deleteDate = async (index) => {
    if (!window.confirm('撮影日を削除しますか？')) return
    const item = shootingDates[index]
    const keys = [
      'scenes',
      'records',
      'current-record',
      'selected-scene',
      'is-recording',
      'is-paused',
      'is-setting-up',
      'setup-start-time',
    ]
    keys.forEach(k => localStorage.removeItem(datePrefix(item.date, k)))
    const { error } = await supabase
      .from('shooting_dates')
      .delete()
      .eq('id', item.id)
    if (!error) {
      setShootingDates(prev => prev.filter((_, i) => i !== index))
    }
    if (activeDate === item.date) {
      setActiveDate(null)
    }
  }

  const exitDate = () => {
    setActiveDate(null)
  }

  const signOut = () => {
    supabase.auth.signOut()
  }

  if (!session) {
    return <AuthForm onAuth={setSession} />
  }

  const resetApp = () => {
    if (!activeDate) return
    const keys = [
      'scenes',
      'records',
      'current-record',
      'selected-scene',
      'is-recording',
      'is-paused',
      'is-setting-up',
      'setup-start-time',
    ]
    keys.forEach((k) => localStorage.removeItem(prefix(k)))

    setScenes([])
    setRecords([])
    setCurrentRecord(null)
    setSelectedScene('')
    setIsRecording(false)
    setIsPaused(false)
    setIsSettingUp(false)
    setSetupStartTime(null)
    setShowResetDialog(false)
  }

  if (!activeDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-between mb-4">
              <button onClick={signOut} className="text-sm text-blue-600">Sign Out</button>
              <div className="flex items-center gap-4">
                <img src="/undone_logo.svg" alt="UNDONE" className="w-12 h-12" />
                <div className="flex items-center gap-3">
                  <Camera className="w-8 h-8 text-blue-600" />
                  <h1 className="text-4xl font-bold text-slate-800">撮影日選択</h1>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4 mb-8">
            {shootingDates.length === 0 && (
              <p className="text-center text-slate-600">登録された撮影がありません</p>
            )}
            {shootingDates.map((item, index) => (
              editingIndex === index ? (
                <div key={index} className="flex gap-2">
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="border rounded px-3 py-2 flex-1"
                  />
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border rounded px-3 py-2 flex-1"
                    placeholder="タイトル"
                  />
                  <Button size="sm" onClick={saveEditDate} className="bg-blue-600 hover:bg-blue-700 text-white">
                    保存
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditDate}>キャンセル</Button>
                </div>
              ) : (
                <div key={item.date} className="flex gap-2 items-center">
                  <Button
                    className="flex-1 justify-start"
                    onClick={() => setActiveDate(item.date)}
                  >
                    <div className="flex justify-between w-full">
                      <span>{item.date.replace(/-/g, '/')}</span>
                      {item.title && (
                        <span className="text-base text-white font-medium">{item.title}</span>
                      )}
                    </div>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => startEditDate(index)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => deleteDate(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
              placeholder="タイトル"
            />
            <Button onClick={addDate} className="bg-blue-600 hover:bg-blue-700 text-white">
              撮影を登録する
            </Button>
          </div>
        </div>
        <footer className="relative text-center text-xs text-slate-500 py-4 space-y-2">
          <div>
            v.{APP_VERSION} - made by <span onClick={handleCreditTap}>Undone</span>
          </div>
          <span
            className={`absolute left-1/2 -translate-x-1/2 -top-2 text-pink-500 transition-opacity duration-700 ${showHearts ? 'opacity-100' : 'opacity-0'}`}
          >
            {'\u2764\u2764\u2764\u2764\u2764'}
          </span>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダーセクション */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-4">
            <button onClick={signOut} className="text-sm text-blue-600">Sign Out</button>
            <div className="flex items-center gap-4">
            <img
              src="/undone_logo.svg"
              alt="UNDONE"
              className="w-12 h-12"
            />
            <div className="flex items-center gap-3">
              <Camera className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-slate-800">撮影記録管理</h1>
            </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={exitDate}>戻る</Button>
            <span className="ml-4 text-slate-700 font-medium">
              {activeDate.replace(/-/g, '/')}
              {activeTitle && ` (${activeTitle})`}
            </span>
          </div>
        </div>

        {/* シーン選択エリア */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-blue-200 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            シーン選択
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                撮影シーン
              </label>
              <select 
                value={selectedScene} 
                onChange={(e) => setSelectedScene(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                disabled={isRecording}
              >
                <option value="">シーンを選択してください</option>
                {scenes.map((scene, index) => (
                  <option key={index} value={scene}>{scene}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => setShowAddScene(!showAddScene)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
                disabled={isRecording}
              >
                <Plus className="w-4 h-4 mr-2" />
                シーン追加
              </Button>
            </div>
          </div>

          {/* シーン追加フォーム */}
          {showAddScene && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex gap-4 items-center mb-4">
                <Button
                  onClick={() => setAddMode('range')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    addMode === 'range'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                  }`}
                >
                  連番追加
                </Button>
                <Button
                  onClick={() => setAddMode('custom')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    addMode === 'custom'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                  }`}
                >
                  カスタム追加
                </Button>
                <span className="text-slate-300 select-none">|</span>
                <Button
                  onClick={toggleThumbnail}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    thumbnailSelected
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                  }`}
                >
                  サムネイル
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleMonologue}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      monologueSelected
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                    }`}
                  >
                    モノローグ
                  </Button>
                  <input
                    type="text"
                    value={monologueName}
                    onChange={(e) => setMonologueName(e.target.value)}
                    className="px-2 py-1 border border-slate-300 rounded"
                    placeholder="人物名"
                    disabled={!monologueSelected}
                  />
                </div>
              </div>

              {addMode === 'range' ? (
                <div className="flex gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      終了番号 (s01から)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={newSceneEnd}
                      onChange={(e) => setNewSceneEnd(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-sm"
                      placeholder="例: 10"
                    />
                  </div>
                  <Button 
                    onClick={addRangeScenes}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
                  >
                    追加
                  </Button>
                </div>
              ) : (
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      シーン名
                    </label>
                    <input
                      type="text"
                      value={customSceneName}
                      onChange={(e) => setCustomSceneName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-sm"
                      placeholder="例: 緊急リテイク"
                    />
                  </div>
                  <Button 
                    onClick={addCustomScene}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
                  >
                    追加
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 撮影コントロールエリア */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-blue-200 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            撮影コントロール
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <div className="flex flex-col gap-3 mb-4 sm:flex-row">
                <Button
                  onClick={startSetup}
                  disabled={!selectedScene || isSettingUp || isRecording}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <RotateCw className="w-5 h-5 mr-2" />
                  段取り開始
                </Button>
                <Button
                  onClick={startRecording}
                  disabled={!selectedScene || isRecording}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Play className="w-5 h-5 mr-2" />
                  撮影開始
                </Button>
                
                <Button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  disabled={!isRecording}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      再開
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      一時停止
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Square className="w-5 h-5 mr-2" />
                  撮影終了
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-medium text-slate-800 mb-2">現在の状況</h3>
              <div className="space-y-2 text-slate-700">
                <p>選択シーン: <span className="text-slate-900 font-medium">{selectedScene || '未選択'}</span></p>
                <p>撮影状態:
                  <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                    isRecording
                      ? isPaused
                        ? 'bg-orange-100 text-orange-800 animate-pulse'
                        : 'bg-green-100 text-green-800 animate-pulse'
                      : isSettingUp
                        ? 'bg-yellow-100 text-yellow-800 animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isRecording
                      ? isPaused
                        ? '一時停止中'
                        : '撮影中'
                      : isSettingUp
                        ? '段取り中'
                        : '待機中'}
                  </span>
                </p>
                {isSettingUp && (
                  <p>段取り経過: <span className="text-slate-900 font-medium">{getSetupDuration()}</span></p>
                )}
                {currentRecord && (
                  <>
                    <p>開始時刻: <span className="text-slate-900 font-medium">{currentRecord.startTime}</span></p>
                    <p>経過時間: <span className="text-slate-900 font-medium">{getCurrentDuration()}</span></p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 撮影記録エリア */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              撮影記録
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={exportToCSV} disabled={records.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  CSV出力
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setShowResetDialog(true)}>
                  <RotateCw className="w-4 h-4 mr-2" />
                  初期化
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">まだ撮影記録がありません</p>
              <p className="text-slate-500">撮影を開始して記録を作成してください</p>
            </div>
          ) : (
            <>
              {/* デスクトップ表示 */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="pb-3 text-slate-700 font-medium">シーン</th>
                      <th className="pb-3 text-slate-700 font-medium">開始時刻</th>
                      <th className="pb-3 text-slate-700 font-medium">終了時刻</th>
                      <th className="pb-3 text-slate-700 font-medium">撮影時間</th>
                      <th className="pb-3 text-slate-700 font-medium">段取り時間</th>
                      <th className="pb-3 text-slate-700 font-medium">備考</th>
                      <th className="pb-3 text-slate-700 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={index} className="border-b border-slate-200">
                        <td className="py-3 text-slate-900 font-medium">{record.scene}</td>
                        <td className="py-3 text-slate-700">{record.startTime}</td>
                        <td className="py-3 text-slate-700">{record.endTime}</td>
                        <td className="py-3 text-slate-700">{record.duration}</td>
                        <td className="py-3 text-slate-700">{record.setupDuration}</td>
                        <td className="py-3 text-slate-700">{record.notes}</td>
                        <td className="py-3">
                          <Button
                            onClick={() => deleteRecord(index)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* モバイル表示 */}
              <div className="md:hidden space-y-4">
                {records.map((record, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-slate-900 font-medium text-lg">{record.scene}</h3>
                      <Button
                        onClick={() => deleteRecord(index)}
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">開始時刻:</span>
                        <span className="text-slate-800">{record.startTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">終了時刻:</span>
                        <span className="text-slate-800">{record.endTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">撮影時間:</span>
                        <span className="text-slate-800">{record.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">段取り時間:</span>
                        <span className="text-slate-800">{record.setupDuration}</span>
                      </div>
                      {record.notes && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">備考:</span>
                          <span className="text-slate-800">{record.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <footer className="relative text-center text-xs text-slate-500 py-4 space-y-2">
        <div>
          v.{APP_VERSION} - made by <span onClick={handleCreditTap}>Undone</span>
        </div>
        <span
          className={`absolute left-1/2 -translate-x-1/2 -top-2 text-pink-500 transition-opacity duration-700 ${showHearts ? 'opacity-100' : 'opacity-0'}`}
        >
          {'\u2764\u2764\u2764\u2764\u2764'}
        </span>
      </footer>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>データを初期化しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              シーン/撮影記録をすべて削除します。元に戻すことはできません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={resetApp} className="bg-red-600 text-white hover:bg-red-700">初期化</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default App

