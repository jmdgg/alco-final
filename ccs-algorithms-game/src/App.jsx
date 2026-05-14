import { useState, useEffect, useMemo, useCallback } from 'react'
import gameData from './data/gameData.json'
import { audio } from './utils/audioEngine'

const CHARACTER_SPRITES = {
  "Dodo": "/DODO.png",
  "Cassie": "/CS - CASSIE.png",
  "Inigo": "/IT - INIGO.png",
  "Mikaela": "/MMA - MIKAELA.png"
}

/* ═══════════════════════════════════════════
   Atmosphere
   ═══════════════════════════════════════════ */
function Atmosphere({ showCollage, crtEffect }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-retro-bg" />
      {showCollage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ backgroundImage: 'url(/story-collage.png)', imageRendering: 'pixelated' }}
        />
      )}
      {crtEffect !== false && (
        <>
          <div className="absolute inset-0 scanlines opacity-25" />
          <div className="scan-bar" />
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Title Screen
   ═══════════════════════════════════════════ */
function TitleScreen({ onStart, onOpenSettings, crtEffect }) {
  const [selected, setSelected] = useState(0)
  const [showAbout, setShowAbout] = useState(false)

  const handleStart = useCallback(() => {
    audio.init()
    audio.playSelect()
    onStart()
  }, [onStart])

  const menuItems = useMemo(() => [
    { label: 'SYSTEM BOOT', action: handleStart },
    { label: 'JOURNAL', action: () => { audio.playSelect(); onStart('journal'); } },
    { label: 'SETTINGS', action: () => { audio.playSelect(); onOpenSettings(); } },
  ], [handleStart, onStart, onOpenSettings])

  useEffect(() => {
    const handler = (e) => {
      if (showAbout) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          audio.playSelect()
          setShowAbout(false)
        }
        return
      }
      if (e.key === 'ArrowUp') {
        setSelected((s) => {
          const next = Math.max(0, s - 1)
          if (next !== s) audio.playHover()
          return next
        })
      }
      if (e.key === 'ArrowDown') {
        setSelected((s) => {
          const next = Math.min(menuItems.length - 1, s + 1)
          if (next !== s) audio.playHover()
          return next
        })
      }
      if (e.key === 'Enter') menuItems[selected].action()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected, showAbout, menuItems])

  return (
    <div className={`relative h-screen w-full overflow-hidden bg-[#1a1c2c] ${crtEffect ? 'crt-screen' : ''}`}>
      {/* Dark underlayer background to maintain rich contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111424] via-[#1a1c2c] to-[#2e1d3c]" />

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: 'url(/bedroom-dev-bg.png)', imageRendering: 'pixelated' }}
      />

      {crtEffect && (
        <>
          <div className="absolute inset-0 scanlines opacity-25 pointer-events-none z-20" />
          <div className="scan-bar z-20" />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
        <div className="mb-16 text-center bg-slate-950/65 backdrop-blur-[2px] border-y-4 border-[#3a495e] py-6 px-8 md:px-20 max-w-3xl w-full shadow-[0_10px_25px_rgba(0,0,0,0.6)] animate-pop-in">
          <h1 className="font-pixel text-[#73eff7] text-3xl md:text-5xl leading-normal tracking-tighter pixel-text-outline-large">
            CCS STUDENT:
          </h1>
          <p className="font-pixel text-[#f7d354] text-sm md:text-base mt-2 tracking-widest pixel-text-outline-small">
            A DAY IN THE LIFE
          </p>
        </div>

        <nav className="flex flex-col items-center gap-6">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              onMouseEnter={() => {
                if (selected !== i) audio.playHover()
                setSelected(i)
              }}
              className={`btn-pixel-menu ${selected === i ? 'selected text-[#f7d354]' : ''}`}
            >
              <span className={`inline-block mr-3 transition-all ${selected === i ? 'opacity-100 animate-[bounce-right_0.8s_steps(2)_infinite]' : 'opacity-0 w-0 overflow-hidden'}`}>
                ▶
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {showAbout && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-[#262b44] border-2 border-[#73eff7] p-8 max-w-xl">
            <h3 className="font-pixel text-[#73eff7] text-sm mb-6 uppercase tracking-tighter">System Info</h3>
            <p className="font-retro text-[#c0cbdc] text-2xl leading-relaxed">
              {gameData.meta.description}
            </p>
            <button
              onClick={() => { audio.playSelect(); setShowAbout(false); }}
              className="mt-8 font-pixel text-[10px] text-[#f7d354] hover:underline cursor-pointer"
            >
              TERMINATE_PROCESS [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Journal Screen
   ═══════════════════════════════════════════ */
function JournalScreen({ onClose, unlockedAlgorithms }) {
  const allAlgorithms = useMemo(() => gameData.algorithms || [], [])
  const [selectedAlgoIndex, setSelectedAlgoIndex] = useState(() => {
    const all = gameData.algorithms || []
    const unlockedIdx = all.findIndex(a => unlockedAlgorithms.includes(a.id))
    return unlockedIdx !== -1 ? unlockedIdx : 0
  })

  const selectedAlgo = allAlgorithms[selectedAlgoIndex]

  return (
    <div className="relative h-screen w-full bg-retro-bg font-retro flex overflow-hidden">
      <div className="absolute inset-0 scanlines opacity-25 pointer-events-none z-0" />
      <div className="scan-bar z-0" />

      {/* LEFT PANE: Grid */}
      <div className="w-1/2 h-full flex flex-col border-r-2 border-retro-muted relative z-10">
        <div className="p-6 border-b-2 border-retro-muted bg-white/50">
          <h1 className="font-pixel text-retro-text text-xl md:text-2xl mb-2">
            STUDENT'S ALGORITHMS JOURNAL
          </h1>
          <div className="flex items-center gap-4">
            <span className="font-pixel text-retro-primary text-xs tracking-wider">
              TOTAL COLLECTED: {unlockedAlgorithms.length} / {allAlgorithms.length}
            </span>
            <div className="flex-1 h-3 bg-retro-muted/30 border border-retro-muted/50 p-[1px]">
              <div
                className="h-full bg-retro-primary transition-all"
                style={{ width: `${(unlockedAlgorithms.length / Math.max(allAlgorithms.length, 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto journal-grid">
          {allAlgorithms.map((algo, i) => {
            const isUnlocked = unlockedAlgorithms.includes(algo.id)
            const isSelected = selectedAlgoIndex === i

            return (
              <div
                key={i}
                onClick={() => {
                  if (isUnlocked) {
                    audio.playSelect()
                    setSelectedAlgoIndex(i)
                  } else {
                    audio.playHover() // Or an error sound if implemented
                  }
                }}
                className={`journal-slot ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`}
              >
                {isUnlocked ? (
                  <span className="text-3xl filter drop-shadow-md">{algo.icon}</span>
                ) : (
                  <span className="font-pixel text-retro-muted text-xl opacity-50 text-center">?</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* RIGHT PANE: Details */}
      <div className="w-1/2 h-full journal-panel flex flex-col relative z-10 p-8 overflow-y-auto">
        <button
          onClick={() => { audio.playSelect(); onClose(); }}
          className="absolute top-6 right-6 font-pixel text-sm text-retro-accent hover:text-retro-primary transition-colors cursor-pointer bg-white px-4 py-2 border-2 border-retro-accent hover:border-retro-primary shadow-[4px_4px_0_rgba(0,0,0,0.1)]"
        >
          [X] BACK
        </button>

        {selectedAlgo && unlockedAlgorithms.includes(selectedAlgo.id) ? (
          <div className="mt-12 space-y-8 animate-pop-in">
            <div>
              <h2 className="font-pixel text-retro-text text-2xl mb-2">{selectedAlgo.title}</h2>
              <span className="inline-block px-3 py-1 bg-retro-gold/20 text-retro-gold font-pixel text-[10px] border border-retro-gold shadow-[2px_2px_0_rgba(212,175,55,0.2)]">
                UNLOCKED: ACHIEVEMENT
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-xl md:text-2xl text-retro-text leading-relaxed">
                <span className="font-bold opacity-70 block mb-1 font-pixel text-xs">Definition:</span>
                {selectedAlgo.definition}
              </p>
              <p className="text-xl md:text-2xl text-retro-text leading-relaxed">
                <span className="font-bold opacity-70 block mb-1 font-pixel text-xs">Key Use Case:</span>
                {selectedAlgo.useCase}
              </p>
            </div>

            {/* Visual Explanation Mock */}
            <div className="w-full h-48 bg-retro-bg/50 border-2 border-retro-muted flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <span className="font-pixel text-retro-muted opacity-50 text-xs absolute top-2 left-2">VISUAL_DIAGRAM_RENDERER</span>
              {selectedAlgo.id === "Dijkstra's Algorithm" ? (
                <div className="absolute inset-0 flex items-center justify-center opacity-80">
                  <div className="flex gap-16 relative">
                    <div className="w-12 h-12 border-2 border-retro-primary rounded-full flex items-center justify-center shadow-[0_0_15px_#27ae60] z-10 bg-white">A</div>
                    <div className="w-12 h-12 border-2 border-retro-muted rounded-full flex items-center justify-center z-10 bg-white">B</div>
                    {/* Connection line */}
                    <div className="absolute top-1/2 left-6 right-6 h-1 bg-retro-primary -translate-y-1/2 shadow-[0_0_10px_#27ae60] z-0"></div>
                  </div>
                </div>
              ) : (
                <div className="text-4xl filter grayscale opacity-50">{selectedAlgo.icon}</div>
              )}
            </div>

            {/* Pseudocode */}
            <div className="bg-[#2c3e50] p-6 rounded-sm shadow-inner border border-[#34495e]">
              <pre className="font-pixel text-[10px] md:text-[11px] text-[#ecf0f1] whitespace-pre-wrap leading-relaxed">
                {selectedAlgo.pseudocode}
              </pre>
            </div>
          </div>
        ) : (
          <div className="mt-12 flex items-center justify-center h-full opacity-50">
            <div className="text-center">
              <p className="font-pixel text-retro-text text-xl mb-4">LOCKED ALGORITHM</p>
              <span className="text-4xl text-retro-muted block">🔒</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Chapter Select Screen Component
   ═══════════════════════════════════════════ */
function ChapterSelectScreen({ onSelectChapter, onClose, crtEffect }) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  // Map 6 static chapters (Chapter 1 is from gameData, Chapters 2-6 are parsed dynamically or hardcoded for select list info)
  const chaptersList = useMemo(() => {
    return gameData.chapters.map((ch, index) => {
      // Descriptions & algorithm lists mapped elegantly to chapters
      const details = [
        {
          desc: "Help Dodo and Cassie solve UI/UX grid alignment issues using mathematical properties, then assist Inigo in managing his morning chaos.",
          focus: "➗ Euclid's, ❗ Factorials",
          bg: "/bedroom-dev-bg.png"
        },
        {
          desc: "Help Cassie validate unique login usernames, find the highest Alco quiz scorer with Mikaela, navigate jeepney terminals, search OPM karaoke books, and match RPG friend names.",
          focus: "🔍 Binary & Interpolation, ⚔️ BF String",
          bg: "/bedroom-dev-bg.png"
        },
        {
          desc: "Help Dodo organize cluttered Figma UI icons by file size, then assist Cassie, Mikaela, and Inigo in compiling and sorting a massive student management database using stable merge sort, quicksort, and heapsort.",
          focus: "🖱️ Selection, 🫧 Bubble, 🔀 Merge, ⚡ Quick, 🌲 Heap",
          bg: "/bedroom-dev-bg.png"
        },
        {
          desc: "Help Inigo find the shortest campus walkway route using Dijkstra's, assist Dodo and Cassie in wiring lab workstations efficiently with Prim's and Kruskal's MSTs, then explore Cassie's RPG character skill tree using BFS and DFS traversals.",
          focus: "📍 Dijkstra, 🛡️ Prim, 🔗 Kruskal, 🌊 BFS, 📍 DFS",
          bg: "/bedroom-dev-bg.png"
        },
        {
          desc: "Calculate optimal coin combinations at vending machines with Change Making, collect dropped bench bounties using Coin Row DP, set grid game high scores with Coin Collecting, and compress documentation files losslessly using Huffman Coding.",
          focus: "🏧 Change, 🪙 Coin Row, 🕹️ Coin Collect, 🗜️ Huffman",
          bg: "/bedroom-dev-bg.png"
        },
        {
          desc: "Debug intricate logic circuits incrementally with Backtracking exhaustive search, and pack presentation essentials optimally using Branch and Bound pruning techniques before graduation.",
          focus: "🔂 Backtracking, ✂️ Branch & Bound",
          bg: "/bedroom-dev-bg.png"
        }
      ]
      return {
        id: ch.id,
        title: ch.title,
        desc: details[index]?.desc || "Solve computer science algorithm challenges and complete AUF coursework under pressure.",
        focus: details[index]?.focus || "O-notation Complexity analysis",
        bg: details[index]?.bg || "/bedroom-dev-bg.png"
      }
    })
  }, [])

  const handlePrev = useCallback(() => {
    audio.playSelect()
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : chaptersList.length - 1))
  }, [chaptersList])

  const handleNext = useCallback(() => {
    audio.playSelect()
    setSelectedIdx((prev) => (prev < chaptersList.length - 1 ? prev + 1 : 0))
  }, [chaptersList])

  const handleBoot = useCallback(() => {
    audio.playSelect()
    onSelectChapter(chaptersList[selectedIdx].id)
  }, [chaptersList, selectedIdx, onSelectChapter])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Enter') handleBoot()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handlePrev, handleNext, handleBoot])

  const activeChapter = chaptersList[selectedIdx]

  return (
    <div className={`relative h-screen w-full overflow-hidden bg-[#111424] text-white flex flex-col items-center justify-center font-retro ${crtEffect ? 'crt-screen' : ''}`}>
      {/* Background Graphic with Vignette Dimming (Kept completely static to block any html body background leaks) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#111424]/90 via-[#111424]/75 to-[#1a1c2c]" />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
        style={{ backgroundImage: `url(${activeChapter.bg})`, imageRendering: 'pixelated' }}
      />
      {crtEffect && (
        <>
          <div className="absolute inset-0 scanlines opacity-25 pointer-events-none z-20" />
          <div className="scan-bar z-20" />
        </>
      )}

      {/* Animated Content Layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center animate-retro-ease-in pointer-events-auto z-10">
        {/* Top Header Navigation */}
        <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-10 w-full max-w-7xl mx-auto">
          <button
            onClick={() => { audio.playSelect(); onClose(); }}
            onMouseEnter={() => audio.playHover()}
            className="font-pixel text-[8px] text-retro-accent hover:text-retro-primary transition-colors cursor-pointer"
          >
            ◀ TERMINATE_BOOT [ESC]
          </button>
          <div className="font-pixel text-[8px] text-retro-muted tracking-widest">
            MODULE_LOADER_V1.2
          </div>
        </header>

        {/* Main Title Banner */}
        <div className="text-center z-10 mb-8 max-w-2xl px-4">
          <h2 className="font-pixel text-[#73eff7] text-sm md:text-base tracking-widest uppercase pixel-text-outline-small animate-pulse">
            SELECT SYSTEM COMPONENT
          </h2>
          <div className="h-1 w-24 bg-retro-accent mx-auto mt-2" />
        </div>

        {/* Selector Deck Carousel */}
        <div className="z-10 w-full relative flex items-center justify-center my-6">
          {/* Left Arrow */}
          <div className="absolute left-8 md:left-16 z-30">
            <button
              onClick={handlePrev}
              onMouseEnter={() => audio.playHover()}
              className="btn-pixel-arrow"
            >
              ◀
            </button>
          </div>

          {/* Viewport for horizontal slider track */}
          <div className="w-full overflow-hidden py-12 flex items-center relative">
            <div
              className="flex gap-6 md:gap-8 transition-transform duration-500 ease-out pb-4"
              style={{
                transform: `translateX(calc(50vw - (${selectedIdx} * (350px + 24px)) - (350px / 2)))`
              }}
            >
              {chaptersList.map((chap, index) => {
                const isActive = selectedIdx === index
                return (
                  <div
                    key={chap.id}
                    onClick={() => {
                      if (!isActive) {
                        audio.playSelect()
                        setSelectedIdx(index)
                      }
                    }}
                    className={`w-[350px] shrink-0 bg-slate-950/85 border-4 rounded-sm p-6 shadow-[0_15px_35px_rgba(0,0,0,0.8)] transition-all duration-500 flex flex-col justify-between select-none relative ${isActive
                        ? 'border-[#f7d354] scale-100 opacity-100 cursor-default'
                        : 'border-[#3a495e] scale-90 opacity-35 hover:opacity-60 cursor-pointer blur-[0.5px]'
                      }`}
                    style={{
                      boxShadow: isActive ? '0 0 25px rgba(247, 211, 84, 0.25)' : ''
                    }}
                  >
                    <div>
                      {/* Top Badge Details */}
                      <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-[#3a495e]/50">
                        <span className="font-pixel text-[8px] text-retro-primary tracking-widest uppercase">
                          SYSTEM MODULE 0{chap.id} / 06
                        </span>
                        {isActive && (
                          <span className="font-pixel text-[8px] text-[#f7d354] px-2 py-0.5 bg-[#f7d354]/10 border border-[#f7d354]/30 uppercase rounded-sm animate-pulse">
                            ACTIVE_FOCUS
                          </span>
                        )}
                      </div>

                      {/* Chapter Title */}
                      <h3 className={`font-pixel uppercase tracking-tight mb-4 min-h-[60px] flex items-center break-words whitespace-normal leading-snug transition-colors duration-300 ${isActive ? 'text-[#f7d354] text-base md:text-lg' : 'text-retro-muted text-sm md:text-base'
                        }`}>
                        {chap.title}
                      </h3>

                      {/* Narrative / Focus Details */}
                      <p className={`text-retro-text text-base leading-relaxed font-retro transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60 line-clamp-3'
                        }`}>
                        {chap.desc}
                      </p>
                    </div>

                    <div className={`space-y-4 transition-all duration-500 ${isActive ? 'opacity-100 max-h-[160px] mt-6' : 'opacity-0 max-h-0 overflow-hidden mt-0'
                      }`}>
                      {/* Focus Algorithm highlights */}
                      <div className="flex items-center gap-3 py-2 px-3 bg-[#111424] border border-[#3a495e]/30">
                        <span className="font-pixel text-[8px] text-retro-accent uppercase tracking-wider">FOCUS:</span>
                        <span className="font-retro text-sm text-[#73eff7] tracking-wider font-bold">
                          {chap.focus}
                        </span>
                      </div>

                      {/* Boot Command */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBoot()
                        }}
                        onMouseEnter={() => audio.playHover()}
                        className="btn-pixel-menu text-xs w-full py-3"
                      >
                        ENTER CHAPTER [ENTER]
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Arrow */}
          <div className="absolute right-8 md:right-16 z-30">
            <button
              onClick={handleNext}
              onMouseEnter={() => audio.playHover()}
              className="btn-pixel-arrow"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Pagination Dot indicators */}
        <div className="z-10 flex gap-4 mt-8">
          {chaptersList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { audio.playSelect(); setSelectedIdx(idx); }}
              onMouseEnter={() => { if (selectedIdx !== idx) audio.playHover(); }}
              className={`font-pixel text-xs cursor-pointer focus:outline-none transition-all ${selectedIdx === idx ? 'text-[#f7d354] scale-125' : 'text-[#8b9bb4]/50 hover:text-white'
                }`}
            >
              {selectedIdx === idx ? '■' : '□'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Settings Modal Component
   ═══════════════════════════════════════════ */
function SettingsModal({ settings, onChangeSettings, onClose, onResetProgress }) {
  const [resetConfirm, setResetConfirm] = useState(false)

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    onChangeSettings(prev => ({ ...prev, masterVolume: val }))
  }

  const handleBgmChange = (e) => {
    const val = parseFloat(e.target.value)
    onChangeSettings(prev => ({ ...prev, bgmVolume: val }))
  }

  const handleSpeedChange = (speed) => {
    audio.playSelect()
    onChangeSettings(prev => ({ ...prev, typewriterSpeed: speed }))
  }

  const handleCrtChange = (e) => {
    audio.playSelect()
    onChangeSettings(prev => ({ ...prev, crtEffect: e.target.checked }))
  }

  const triggerReset = () => {
    audio.playSelect()
    if (!resetConfirm) {
      setResetConfirm(true)
    } else {
      onResetProgress()
      setResetConfirm(false)
      audio.playAdvance()
      onClose()
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[1px] px-4">
      <div className="bg-[#1a1c2c] border-4 border-[#3a495e] p-8 max-w-md w-full shadow-[0_15px_35px_rgba(0,0,0,0.8)] animate-pop-in font-retro text-white">
        <h2 className="font-pixel text-[#f7d354] text-center text-xs md:text-sm mb-8 uppercase tracking-widest text-shadow-md">
          [ SYSTEM CONFIG ]
        </h2>

        <div className="space-y-6 font-retro">
          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex justify-between font-pixel text-[8px] md:text-[10px] text-[#8b9bb4]">
              <span>MASTER_VOLUME</span>
              <span>{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={handleVolumeChange}
              onMouseUp={() => audio.playSelect()}
              className="w-full pixel-slider"
            />
          </div>

          {/* BGM Volume */}
          <div className="space-y-2">
            <div className="flex justify-between font-pixel text-[8px] md:text-[10px] text-[#8b9bb4]">
              <span>BGM_VOLUME</span>
              <span>{Math.round(settings.bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.bgmVolume}
              onChange={handleBgmChange}
              onMouseUp={() => audio.playSelect()}
              className="w-full pixel-slider"
            />
          </div>

          {/* Typewriter Speed */}
          <div className="space-y-3">
            <span className="block font-pixel text-[8px] md:text-[10px] text-[#8b9bb4]">TEXT_SPEED</span>
            <div className="grid grid-cols-4 gap-2">
              {['slow', 'normal', 'fast', 'instant'].map((sp) => (
                <button
                  key={sp}
                  onClick={() => handleSpeedChange(sp)}
                  onMouseEnter={() => audio.playHover()}
                  className={`font-pixel text-[6px] md:text-[8px] py-2 border-2 text-center transition-all cursor-pointer uppercase ${settings.typewriterSpeed === sp
                      ? 'border-[#f7d354] text-[#f7d354] bg-[#2c2f44]'
                      : 'border-[#3a495e] text-[#8b9bb4] hover:border-white hover:text-white'
                    }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* CRT Overlay Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-b border-[#3a495e]/50">
            <span className="font-pixel text-[8px] md:text-[10px] text-[#8b9bb4]">CRT_EMULATION</span>
            <input
              type="checkbox"
              checked={settings.crtEffect}
              onChange={handleCrtChange}
              className="pixel-checkbox"
            />
          </div>

          {/* Reset progress */}
          {onResetProgress && (
            <div className="pt-2">
              <button
                onClick={triggerReset}
                onMouseEnter={() => audio.playHover()}
                className={`w-full font-pixel text-[6px] md:text-[8px] py-2 border-2 text-center transition-all cursor-pointer uppercase ${resetConfirm
                    ? 'border-red-500 text-red-500 bg-red-950/20 animate-pulse'
                    : 'border-[#3a495e] text-[#8b9bb4] hover:border-red-500 hover:text-red-500'
                  }`}
              >
                {resetConfirm ? 'CONFIRM_RESET ?' : 'RESET_SYSTEM_PROGRESS'}
              </button>
              {resetConfirm && (
                <button
                  onClick={() => { audio.playSelect(); setResetConfirm(false); }}
                  className="w-full text-center font-retro text-red-400 text-xs mt-1 hover:underline cursor-pointer uppercase"
                >
                  [ CANCEL_ABORT ]
                </button>
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => { audio.playSelect(); onClose(); }}
            onMouseEnter={() => audio.playHover()}
            className="btn-pixel-menu text-[10px] md:text-xs w-full py-2"
          >
            CONFIRM & CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Main Game Screen
   ═══════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState('title')
  const [prevScreen, setPrevScreen] = useState('title')
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ccs_student_settings')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // default settings
      }
    }
    return {
      masterVolume: 0.5,
      bgmVolume: 0.5,
      typewriterSpeed: 'normal',
      crtEffect: true
    }
  })
  const [showSettings, setShowSettings] = useState(false)

  // Sync settings to localStorage and audioEngine
  useEffect(() => {
    localStorage.setItem('ccs_student_settings', JSON.stringify(settings))
    audio.setMasterVolume(settings.masterVolume)
    audio.setBgmVolume(settings.bgmVolume)
  }, [settings])

  const speedMap = useMemo(() => ({
    slow: 60,
    normal: 30,
    fast: 10,
    instant: 0
  }), [])

  const typewriterDelay = speedMap[settings.typewriterSpeed] ?? 30

  const [currentChapter, setCurrentChapter] = useState(1)
  const [currentNode, setCurrentNode] = useState('start')
  const [unlockedAlgorithms, setUnlockedAlgorithms] = useState([])
  const [hoveredChoice, setHoveredChoice] = useState(null)

  const [achievementPopup, setAchievementPopup] = useState(null)

  // Typewriter State

  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [textIndex, setTextIndex] = useState(0)
  const chapter = gameData.chapters.find((c) => c.id === currentChapter)
  const node = chapter?.nodes?.[currentNode]

  useEffect(() => {
    if (screen === 'title') {
      audio.playTitleMusic()
    } else if (screen === 'game') {
      audio.playGameMusic()
    }
  }, [screen])

  // Typewriter Effect logic
  useEffect(() => {
    if (screen !== 'game' || !node) return;
    const timer = setTimeout(() => {
      if (settings.typewriterSpeed === 'instant') {
        setDisplayedText(node.text)
        setTextIndex(node.text.length)
        setIsTyping(false)
      } else {
        setDisplayedText('')
        setTextIndex(0)
        setIsTyping(true)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [node, screen, settings.typewriterSpeed])

  useEffect(() => {
    if (screen !== 'game' || !node || !isTyping) return;

    if (textIndex < node.text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(node.text.slice(0, textIndex + 1))
        audio.playTypewriter()
        setTextIndex(prev => prev + 1)
      }, typewriterDelay)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setIsTyping(false)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [textIndex, isTyping, node, screen, typewriterDelay])

  // Choice Pop Sounds
  useEffect(() => {
    if (!isTyping && screen === 'game' && node?.choices) {
      const timers = node.choices.map((_, i) =>
        setTimeout(() => audio.playPop(), i * 150)
      )
      return () => timers.forEach(clearTimeout)
    }
  }, [isTyping, node, screen])

  // Fast-forward listener
  useEffect(() => {
    const handleFF = (e) => {
      if (e.key === 'Shift' && isTyping) {
        setDisplayedText(node.text)
        setTextIndex(node.text.length)
        setIsTyping(false)
      }
    }
    window.addEventListener('keydown', handleFF)

    return () => {
      window.removeEventListener('keydown', handleFF)
    }
  }, [isTyping, node])

  function handleChoice(choice) {
    audio.playSelect()

    // Immediate reset to prevent flashing next-node choices
    setDisplayedText('')
    setTextIndex(0)
    setIsTyping(true)

    if (choice.unlocksAlgorithm && !unlockedAlgorithms.includes(choice.unlocksAlgorithm)) {
      setUnlockedAlgorithms((prev) => [...prev, choice.unlocksAlgorithm])
      audio.playUnlock()

      // Trigger Achievement Popup
      setAchievementPopup(choice.unlocksAlgorithm)
      setTimeout(() => {
        setAchievementPopup((prev) => prev === choice.unlocksAlgorithm ? null : prev)
      }, 4000)
    }
    if (choice.returnToMenu) {
      setScreen('chapter_select')
      return
    }
    if (choice.restartChapter) {
      audio.playAdvance()
      setCurrentNode('start')
      return
    }
    if (choice.resetProgress) {
      audio.playAdvance()
      setUnlockedAlgorithms([])
      setCurrentChapter(1)
      setCurrentNode('start')
      setScreen('title')
      return
    }
    if (choice.advanceChapter) {
      audio.playAdvance()
      const nextIdx = gameData.chapters.findIndex((c) => c.id === currentChapter) + 1
      if (nextIdx < gameData.chapters.length) {
        setCurrentChapter(gameData.chapters[nextIdx].id)
        setCurrentNode(choice.nextNode)
        return
      }
    }
    setCurrentNode(choice.nextNode)
  }

  // Centralized keyboard shortcuts supervisor (Escape, S, J)
  useEffect(() => {
    const handleKeydown = (e) => {
      // Ignore if pressing modifier keys
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === 'Escape') {
        e.preventDefault()
        audio.playSelect()
        if (showSettings) {
          setShowSettings(false)
        } else if (screen === 'journal') {
          setScreen(prevScreen)
        } else if (screen === 'chapter_select') {
          setScreen('title')
        } else {
          setShowSettings(true)
        }
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault()
        audio.playSelect()
        setShowSettings((prev) => !prev)
      } else if (e.key.toLowerCase() === 'j') {
        e.preventDefault()
        audio.playSelect()
        if (showSettings) return // don't open journal if settings modal is active
        if (screen === 'journal') {
          setScreen(prevScreen)
        } else {
          setPrevScreen(screen)
          setScreen('journal')
        }
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [showSettings, screen, prevScreen])

  if (screen === 'title') {
    return (
      <>
        <TitleScreen
          onStart={(target = 'chapter_select') => { setPrevScreen(screen); setScreen(target); }}
          onOpenSettings={() => setShowSettings(true)}
          crtEffect={settings.crtEffect}
        />
        {showSettings && (
          <SettingsModal
            settings={settings}
            onChangeSettings={setSettings}
            onClose={() => setShowSettings(false)}
            onResetProgress={() => {
              setUnlockedAlgorithms([])
              setCurrentChapter(1)
              setCurrentNode('start')
            }}
          />
        )}
      </>
    )
  }

  if (screen === 'chapter_select') {
    return (
      <>
        <ChapterSelectScreen
          onSelectChapter={(chapId) => {
            setCurrentChapter(chapId)
            setCurrentNode('start')
            setScreen('game')
          }}
          onClose={() => setScreen('title')}
          crtEffect={settings.crtEffect}
        />
        {showSettings && (
          <SettingsModal
            settings={settings}
            onChangeSettings={setSettings}
            onClose={() => setShowSettings(false)}
            onResetProgress={() => {
              setUnlockedAlgorithms([])
              setCurrentChapter(1)
              setCurrentNode('start')
            }}
          />
        )}
      </>
    )
  }

  if (screen === 'journal') {
    return (
      <>
        <JournalScreen onClose={() => setScreen(prevScreen)} unlockedAlgorithms={unlockedAlgorithms} />
        {showSettings && (
          <SettingsModal
            settings={settings}
            onChangeSettings={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </>
    )
  }

  if (!chapter || !node) return null

  return (
    <>
      <div className={`flex h-screen w-full bg-retro-bg overflow-hidden font-retro ${settings.crtEffect ? 'crt-screen' : ''}`}>
        <Atmosphere showCollage={true} crtEffect={settings.crtEffect} />

        {/* LEFT COLUMN: Narrative & Choices */}
        <div className="w-1/2 flex flex-col dialogue-panel z-10 relative">
          <header className="px-8 pt-8 pb-4 flex justify-between items-start">
            <h2 className="font-pixel text-retro-accent text-sm md:text-base glow-accent tracking-tighter uppercase">
              CHAPTER {chapter.id}: {chapter.title}
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => { audio.playSelect(); setShowSettings(true); }}
                className="font-pixel text-[8px] text-retro-accent hover:text-retro-primary transition-colors cursor-pointer"
              >
                [S] SETTINGS
              </button>
              <button
                onClick={() => { audio.playSelect(); setPrevScreen(screen); setScreen('journal'); }}
                className="font-pixel text-[8px] text-retro-primary hover:text-retro-accent transition-colors cursor-pointer"
              >
                [J] JOURNAL
              </button>
              <button
                onClick={() => { audio.playSelect(); setScreen('title'); }}
                className="font-pixel text-[8px] text-retro-accent hover:text-retro-primary transition-colors cursor-pointer"
              >
                ◀ MENU
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6 relative">

            {/* Achievement Popup */}
            {achievementPopup && (
              <div className="absolute top-0 left-8 z-50 achievement-popup">
                <div className="bg-[#fcebb6] border-4 border-[#b97a2e] rounded-sm p-3 flex items-center gap-4 shadow-[4px_4px_0_rgba(0,0,0,0.2)] max-w-sm">
                  <div className="text-3xl filter drop-shadow-md relative">
                    🎖️
                    {/* Subtle Sparkle Effects */}
                    <span className="absolute -top-1 -left-1 text-[#ffea00] animate-pulse text-xs">✨</span>
                    <span className="absolute -bottom-1 -right-1 text-[#ffea00] animate-pulse text-xs" style={{ animationDelay: '0.2s' }}>✨</span>
                  </div>
                  <div>
                    <p className="font-pixel text-[10px] text-[#8a5a22] tracking-wider mb-1">ACHIEVEMENT UNLOCKED:</p>
                    <p className="font-retro text-[#5c3c16] text-lg font-bold leading-none">{achievementPopup}</p>
                  </div>
                </div>
              </div>
            )}

            {node.speaker && (
              <span className="inline-block px-3 py-1 bg-retro-primary/10 text-retro-primary font-pixel text-[10px] border border-retro-primary/30 uppercase">
                {node.speaker}
              </span>
            )}
            <p className="text-2xl md:text-3xl leading-relaxed text-retro-text opacity-90 font-retro min-h-[100px]">
              {displayedText}
              {isTyping && <span className="inline-block w-2 h-6 bg-retro-accent ml-1 animate-pulse" />}
            </p>
          </div>

          <div className="p-8 space-y-4 mb-8 min-h-[300px]">
            {!isTyping && node.choices.map((choice, i) => (
              <button
                key={i}
                onMouseEnter={() => { audio.playHover(); setHoveredChoice(i); }}
                onMouseLeave={() => setHoveredChoice(null)}
                onClick={() => handleChoice(choice)}
                className={`choice-btn w-full text-left font-retro opacity-0 animate-pop-in ${hoveredChoice === i ? 'selected' : ''}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <span className="flex items-center gap-3">
                  {choice.icon && (
                    <span className="font-pixel text-xs text-retro-primary opacity-70">[{choice.icon}]</span>
                  )}
                  {choice.label}
                </span>
                {choice.unlocksAlgorithm && (
                  <span className="font-pixel text-[8px] text-retro-primary opacity-60">
                    + ACHIEVEMENT
                  </span>
                )}
              </button>
            ))}
          </div>

          <footer className="px-8 py-4 border-t border-retro-accent/10 flex justify-between items-center text-[10px] font-pixel text-retro-muted">
            <span>ALGORITHMS UNLOCKED: {unlockedAlgorithms.length}</span>
            <span className="opacity-50 tracking-widest">[SHIFT] FAST_FORWARD</span>
          </footer>
        </div>

        {/* RIGHT COLUMN: Character Sprites */}
        <div className="w-1/2 h-full relative pointer-events-none overflow-hidden flex items-end justify-end">
          <div className="relative w-full h-full flex items-end justify-end translate-y-48 translate-x-12">
            {Object.entries(CHARACTER_SPRITES).map(([name, src], idx) => {
              const isActive = node.speaker === name;
              const isSpeaking = isActive && isTyping;
              return (
                <img
                  key={name}
                  src={src}
                  alt={name}
                  className={`character-sprite ${isActive ? 'active' : ''} ${isSpeaking ? 'sprite-talking' : ''} absolute`}
                  style={{
                    right: `${(Object.keys(CHARACTER_SPRITES).length - 1 - idx) * 280 - 120}px`,
                    zIndex: isActive ? 40 : 10 + idx,
                    maxWidth: '550px',
                    height: '110vh'
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onChangeSettings={setSettings}
          onClose={() => setShowSettings(false)}
          onResetProgress={() => {
            setUnlockedAlgorithms([])
            setCurrentChapter(1)
            setCurrentNode('start')
          }}
        />
      )}
    </>
  )
}
