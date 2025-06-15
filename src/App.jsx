import { useState, useEffect } from 'react'
import {
  Play,
  Pause,
  Square,
  Plus,
  Download,
  Trash2,
  Clock,
  Camera,
  MoreVertical,
  RotateCw,
  Timer,
} from 'lucide-react'
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

const DIRECTOR_NAMES = [
  '小津安二郎',
  '黒澤明',
  '溝口健二',
  '成瀬巳喜男',
  '今村昌平',
  '新藤兼人',
  '山田洋次',
  '伊丹十三',
  '大林宣彦',
  '是枝裕和',
  '園子温',
  '中島哲也',
  '石井裕也',
  '庵野秀明',
  '河瀬直美',
  '岩井俊二',
  '瀬々敬久',
  '白石和彌',
  '佐藤信介',
  '三池崇史',
  '塚本晋也',
  '原田眞人',
  '森達也',
  '真利子哲也',
  '荒井晴彦',
  '山下敦弘',
  '上田慎一郎',
  '奥山和由',
  '内田けんじ',
  '平山秀幸',
  '西川美和',
  '黒沢清',
  '青山真治',
  'スタンリー・キューブリック',
  'アルフレッド・ヒッチコック',
  'オーソン・ウェルズ',
  'ジャン＝リュック・ゴダール',
  'フランソワ・トリュフォー',
  'イングマール・ベルイマン',
  'フェデリコ・フェリーニ',
  'アンドレイ・タルコフスキー',
  'サタジット・レイ',
  'セルゲイ・エイゼンシュテイン',
  'アキ・カウリスマキ',
  'クリス・マルケル',
  'クリストファー・ノーラン',
  'クエンティン・タランティーノ',
  'ジェームズ・キャメロン',
  'スティーヴン・スピルバーグ',
  'リドリー・スコット',
  'ピーター・ジャクソン',
  'ジョージ・ルーカス',
  'ザック・スナイダー',
  'J・J・エイブラムス',
  'マイケル・ベイ',
  'デヴィッド・フィンチャー',
  'マーティン・スコセッシ',
  'デニス・ヴィルヌーヴ',
  'ロバート・ゼメキス',
  'ジョン・ラセター',
  'ブラッド・バード',
  'アン・リー',
  'ローランド・エメリッヒ',
  'ジョーダン・ピール',
  'サム・メンデス',
  'マット・リーヴス',
  'ウェス・アンダーソン',
  'ソフィア・コッポラ',
  'グレタ・ガーウィグ',
  'ノア・バームバック',
  'アリ・アスター',
  'ロバート・エガース',
  'ケリー・ライカート',
  'アンドレア・アーノルド',
  'ルカ・グァダニーノ',
  'アリーチェ・ロルヴァケル',
  'クレール・ドニ',
  'チャン・イーモウ',
  'パク・チャヌク',
  'ハン・ジェリム',
  'ジョン・ラセター',
  '宮崎駿',
  '高畑勲',
  '細田守',
  '新海誠',
  '湯浅政明',
  '今敏',
  '大地丙太郎',
  '押井守',
  '渡辺信一郎',
  '山本沙代',
  'ピート・ドクター',
  'トム・ムーア',
  'ヘンリー・セリック',
  'ティム・バートン',
  'ガス・ヴァン・サント',
  'ラース・フォン・トリアー',
  'ニコラス・ウィンディング・レフン',
  'デヴィッド・リンチ',
  'ジム・ジャームッシュ',
  'アレハンドロ・ホドロフスキー',
  'グレッグ・アラキ',
  'アベル・フェラーラ',
  'ジョン・ウォーターズ',
  '須田剛一'
]

const getRandomDirector = () =>
  DIRECTOR_NAMES[Math.floor(Math.random() * DIRECTOR_NAMES.length)]

function App() {
  // 状態管理
  const [scenes, setScenes] = useState(() => {
    const saved = localStorage.getItem('shooting-app-scenes')
    return saved ? JSON.parse(saved) : []
  })
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('shooting-app-records')
    return saved ? JSON.parse(saved) : []
  })
  const [currentRecord, setCurrentRecord] = useState(() => {
    const saved = localStorage.getItem('shooting-app-current-record')
    return saved ? JSON.parse(saved) : null
  })
  const [selectedScene, setSelectedScene] = useState(() => {
    const saved = localStorage.getItem('shooting-app-selected-scene')
    return saved || ''
  })
  const [isRecording, setIsRecording] = useState(() => {
    const saved = localStorage.getItem('shooting-app-is-recording')
    return saved === 'true'
  })
  const [isPaused, setIsPaused] = useState(() => {
    const saved = localStorage.getItem('shooting-app-is-paused')
    return saved === 'true'
  })
  const [showAddScene, setShowAddScene] = useState(false)
  const [addMode, setAddMode] = useState('range')
  const [newSceneEnd, setNewSceneEnd] = useState('')
  const [customSceneName, setCustomSceneName] = useState('')
  const [monologueName, setMonologueName] = useState('')
  const [monologueAdded, setMonologueAdded] = useState(() => {
    const saved = localStorage.getItem('shooting-app-scenes')
    if (!saved) return false
    const list = JSON.parse(saved)
    return list.some((s) => s.endsWith('モノローグ'))
  })
  const [monologueScene, setMonologueScene] = useState(() => {
    const saved = localStorage.getItem('shooting-app-scenes')
    if (!saved) return ''
    const list = JSON.parse(saved)
    const found = list.find((s) => s.endsWith('モノローグ'))
    return found || ''
  })
  const [monologuePlaceholder, setMonologuePlaceholder] = useState(getRandomDirector())
  const [thumbnailAdded, setThumbnailAdded] = useState(() => {
    const saved = localStorage.getItem('shooting-app-scenes')
    if (!saved) return false
    return JSON.parse(saved).includes('サムネイル')
  })
  const [creditTaps, setCreditTaps] = useState(0)
  const [showHearts, setShowHearts] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(() => {
    const saved = localStorage.getItem('shooting-app-is-setting-up')
    return saved === 'true'
  })
  const [setupStartTime, setSetupStartTime] = useState(() => {
    const saved = localStorage.getItem('shooting-app-setup-start-time')
    return saved ? parseInt(saved) : null
  })

  useEffect(() => {
    if (addMode === 'monologue' && showAddScene && !monologueAdded) {
      setMonologuePlaceholder(getRandomDirector())
    }
  }, [addMode, showAddScene, monologueAdded])

  // ローカルストレージへの保存
  useEffect(() => {
    localStorage.setItem('shooting-app-scenes', JSON.stringify(scenes))
  }, [scenes])

  useEffect(() => {
    setThumbnailAdded(scenes.includes('サムネイル'))
    const found = scenes.find((s) => s.endsWith('モノローグ'))
    if (found) {
      setMonologueAdded(true)
      setMonologueScene(found)
    } else {
      setMonologueAdded(false)
      setMonologueScene('')
    }
  }, [scenes])

  useEffect(() => {
    localStorage.setItem('shooting-app-records', JSON.stringify(records))
  }, [records])

  useEffect(() => {
    localStorage.setItem('shooting-app-current-record', JSON.stringify(currentRecord))
  }, [currentRecord])

  useEffect(() => {
    localStorage.setItem('shooting-app-selected-scene', selectedScene)
  }, [selectedScene])

  useEffect(() => {
    localStorage.setItem('shooting-app-is-recording', isRecording.toString())
  }, [isRecording])

  useEffect(() => {
    localStorage.setItem('shooting-app-is-paused', isPaused.toString())
  }, [isPaused])

  useEffect(() => {
    localStorage.setItem('shooting-app-is-setting-up', isSettingUp.toString())
  }, [isSettingUp])

  useEffect(() => {
    if (setupStartTime)
      localStorage.setItem('shooting-app-setup-start-time', setupStartTime.toString())
    else
      localStorage.removeItem('shooting-app-setup-start-time')
  }, [setupStartTime])

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

  const addThumbnailScene = () => {
    setScenes(prev => {
      if (prev.includes('サムネイル')) {
        return prev.filter((s) => s !== 'サムネイル')
      }
      return [...prev, 'サムネイル']
    })
  }

  const addMonologueScene = () => {
    if (!monologueAdded) {
      const name = monologueName.trim()
      const sceneName = name ? `${name} - モノローグ` : 'モノローグ'
      setScenes(prev => [...prev, sceneName])
      setMonologueScene(sceneName)
      setMonologueAdded(true)
      setMonologueName('')
      setShowAddScene(false)
      setAddMode('range')
    } else {
      setScenes(prev => prev.filter((s) => s !== monologueScene))
      setMonologueAdded(false)
      setMonologueScene('')
      setMonologueName('')
    }
  }

  const startSetup = () => {
    if (isSettingUp || isRecording) return
    const now = Date.now()
    setIsSettingUp(true)
    setSetupStartTime(now)
  }

  // 撮影記録機能
  const startRecording = () => {
    if (!selectedScene) return

    const now = new Date()
    const startTime = now.toLocaleTimeString('ja-JP', { hour12: false })

    let prepDuration = null
    if (isSettingUp && setupStartTime) {
      prepDuration = formatDuration(now.getTime() - setupStartTime)
    }

    setCurrentRecord({
      scene: selectedScene,
      startTime: startTime,
      startTimestamp: now.getTime(),
      pausedDuration: 0,
      pauseStartTime: null,
      hasPauses: false,
      setupDuration: prepDuration
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

  const getSetupDuration = () => {
    if (!isSettingUp || !setupStartTime) return '00:00:00'
    const now = Date.now()
    return formatDuration(now - setupStartTime)
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

  // リアルタイム更新のためのuseEffect
  const [currentTime, setCurrentTime] = useState(Date.now())
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRecording) {
        setCurrentTime(Date.now())
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isRecording])

  // ページ読み込み時の撮影状態復元
  useEffect(() => {
    if (isRecording && currentRecord) {
      // 撮影中の状態でページがリロードされた場合、タイマーを再開
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
    
    const headers = ['日付', 'シーン', '段取り時間', '開始時刻', '終了時刻', '撮影時間', '備考']
    const csvData = records.map(record => [
      today,
      record.scene,
      record.setupDuration || '',
      record.startTime,
      record.endTime,
      record.duration,
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

  const resetApp = () => {
    localStorage.removeItem('shooting-app-scenes')
    localStorage.removeItem('shooting-app-records')
    localStorage.removeItem('shooting-app-current-record')
    localStorage.removeItem('shooting-app-selected-scene')
    localStorage.removeItem('shooting-app-is-recording')
    localStorage.removeItem('shooting-app-is-paused')
    localStorage.removeItem('shooting-app-is-setting-up')
    localStorage.removeItem('shooting-app-setup-start-time')

    setScenes([])
    setRecords([])
    setCurrentRecord(null)
    setSelectedScene('')
    setIsRecording(false)
    setIsPaused(false)
    setIsSettingUp(false)
    setSetupStartTime(null)
    setThumbnailAdded(false)
    setMonologueAdded(false)
    setMonologueScene('')
    setMonologueName('')
    setShowResetDialog(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダーセクション */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
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
              <div className="flex flex-wrap gap-4 mb-4">
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
                <Button
                  onClick={addThumbnailScene}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    thumbnailAdded
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                  }`}
                >
                  サムネイル
                </Button>
                <Button
                  onClick={() => setAddMode('monologue')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    addMode === 'monologue' || monologueAdded
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
                  }`}
                >
                  モノローグ
                </Button>
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
              ) : addMode === 'custom' ? (
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
              ) : (
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      人物名（任意）
                    </label>
                    <input
                      type="text"
                      value={monologueName}
                      onChange={(e) => setMonologueName(e.target.value)}
                      disabled={monologueAdded}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-sm disabled:bg-slate-100"
                      placeholder={monologuePlaceholder}
                    />
                  </div>
                  <Button
                    onClick={addMonologueScene}
                    className={`px-4 py-2 rounded-lg shadow-md ${
                      monologueAdded
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {monologueAdded ? '削除' : '追加'}
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
              <div className="flex gap-3 mb-4">
                <Button
                  onClick={startSetup}
                  disabled={isSettingUp || isRecording}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Timer className="w-5 h-5 mr-2" />
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
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
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
                    {currentRecord.setupDuration && (
                      <p>段取り時間: <span className="text-slate-900 font-medium">{currentRecord.setupDuration}</span></p>
                    )}
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
                      <th className="pb-3 text-slate-700 font-medium">段取り時間</th>
                      <th className="pb-3 text-slate-700 font-medium">開始時刻</th>
                      <th className="pb-3 text-slate-700 font-medium">終了時刻</th>
                      <th className="pb-3 text-slate-700 font-medium">撮影時間</th>
                      <th className="pb-3 text-slate-700 font-medium">備考</th>
                      <th className="pb-3 text-slate-700 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={index} className="border-b border-slate-200">
                        <td className="py-3 text-slate-900 font-medium">{record.scene}</td>
                        <td className="py-3 text-slate-700">{record.setupDuration || '-'}</td>
                        <td className="py-3 text-slate-700">{record.startTime}</td>
                        <td className="py-3 text-slate-700">{record.endTime}</td>
                        <td className="py-3 text-slate-700">{record.duration}</td>
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
                        <span className="text-slate-600">段取り時間:</span>
                        <span className="text-slate-800">{record.setupDuration || '-'}</span>
                      </div>
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
          v{APP_VERSION} - made by <span onClick={handleCreditTap}>Undone</span>
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

