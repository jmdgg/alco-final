import { useState, useEffect, useRef, useMemo } from 'react'
import gameData from './data/gameData.json'
import { audio } from './utils/audioEngine'

/* ═══════════════════════════════════════════
   Atmosphere
   ═══════════════════════════════════════════ */
function Atmosphere({ showCollage }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-retro-bg" />
      {showCollage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ backgroundImage: 'url(/story-collage.png)', imageRendering: 'pixelated' }}
        />
      )}
      <div className="absolute inset-0 scanlines opacity-10" />
    </div>
  )
}

/* ═══════════════════════════════════════════
   Title Screen
   ═══════════════════════════════════════════ */
function TitleScreen({ onStart }) {
  const [selected, setSelected] = useState(0)
  const [showAbout, setShowAbout] = useState(false)

  const handleStart = () => {
    audio.init()
    audio.playSelect()
    onStart('chapterSelection')
  }

  const menuItems = [
    { label: 'SYSTEM BOOT', action: handleStart },
    { label: 'JOURNAL', action: () => { audio.playSelect(); onStart('journal'); } },
  ]

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
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1c2c] crt-screen">
      {/* Dark starry background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1c2c] via-[#262b44] to-[#68386c]" />

      <div
        className="absolute inset-0 bg-cover bg-bottom bg-no-repeat opacity-50"
        style={{ backgroundImage: 'url(/title-bg.png)', imageRendering: 'pixelated' }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="mb-16 text-center">
          <h1 className="font-pixel text-[#73eff7] text-3xl md:text-5xl leading-normal tracking-tighter drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
            CCS STUDENT:
          </h1>
          <p className="font-pixel text-[#f7d354] text-sm md:text-base mt-2 tracking-widest drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
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
              className={`font-pixel text-xs md:text-sm tracking-wide transition-all px-8 py-3 
                ${selected === i ? 'text-[#f7d354] scale-110' : 'text-[#8b9bb4]'}`}
            >
              <span className={`inline-block mr-3 ${selected === i ? 'animate-selector opacity-100' : 'opacity-0'}`}>▶</span>
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
   Chapter Selection (Course Syllabus)
   ═══════════════════════════════════════════ */
function ChapterSelectionScreen({ onBack, onSelect }) {
  const [hovered, setHovered] = useState(null)
  
  const chapters = [
    { id: 1, title: 'Searching & Pattern Matching', iconPos: '0px 0px', description: 'Master the art of finding information in large datasets.' },
    { id: 2, title: 'Sorting', iconPos: '-32px 0px', description: 'Organize data efficiently to optimize performance.' },
    { id: 3, title: 'Graphs & Networks', iconPos: '-64px 0px', description: 'Navigate complex connections and find shortest paths.' },
    { id: 4, title: 'Dynamic Programming', iconPos: '-96px 0px', description: 'Solve complex problems via subproblem optimization.' },
    { id: 5, title: 'State-Space Search', iconPos: '-128px 0px', description: 'Explore decision trees to find optimal paths.' }
  ]

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        audio.playSelect()
        onBack()
      }
      if (e.key === 'Enter' && hovered !== null) {
        audio.playSelect()
        onSelect(chapters[hovered].id)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onBack, onSelect, hovered, chapters])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-retro-bg font-retro">
      {/* Background with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[2px] opacity-40 grayscale-[20%]"
        style={{ backgroundImage: 'url(/syllabus-bg.png)', imageRendering: 'pixelated' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/40" />
      <div className="absolute inset-0 scanlines opacity-5" />

      {/* Header */}
      <header className="relative z-20 p-8 flex justify-between items-center">
        <button 
          onClick={() => { audio.playSelect(); onBack(); }}
          className="font-pixel text-[10px] text-retro-accent hover:text-retro-primary transition-all flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">[ ESC ]</span> BACK
        </button>
        
        <h1 className="font-pixel text-retro-text text-xl md:text-3xl tracking-tighter drop-shadow-sm">
          COURSE SYLLABUS: <span className="text-retro-accent">SELECT MODULE</span>
        </h1>
        
        <div className="w-[100px]" /> {/* Spacer */}
      </header>

      {/* Curriculum Map / Grid */}
      <main className="relative z-20 max-w-6xl mx-auto px-8 py-4 h-[calc(100vh-160px)] flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {chapters.map((ch, i) => (
            <div
              key={ch.id}
              onMouseEnter={() => { audio.playHover(); setHovered(i); }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { audio.playSelect(); onSelect(ch.id); }}
              className={`relative cursor-pointer transition-all duration-200 group
                ${hovered === i ? 'scale-105 z-10' : 'scale-100 opacity-90'}
              `}
            >
              {/* Connection Line (Visual Only) */}
              {i < chapters.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[2px] bg-retro-border z-0" />
              )}

              <div className={`
                bg-white/90 border-4 p-6 flex flex-col items-center text-center gap-4
                shadow-[8px_8px_0_rgba(0,0,0,0.05)] h-full
                transition-colors duration-200
                ${hovered === i ? 'border-retro-accent bg-white' : 'border-retro-muted/30'}
              `}>
                {/* Pixel Art Icon Container */}
                <div className={`
                  w-20 h-20 border-2 flex items-center justify-center bg-retro-dark
                  ${hovered === i ? 'border-retro-accent' : 'border-retro-muted/20'}
                `}>
                  <div 
                    className="w-16 h-16"
                    style={{ 
                      backgroundImage: 'url(/chapter-icons.png)',
                      backgroundPosition: ch.iconPos,
                      backgroundSize: '160px 32px', // Adjusted to match icon sheet scale
                      imageRendering: 'pixelated',
                      transform: 'scale(2)', // Scale up for better visibility
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </div>

                <div>
                  <p className="font-pixel text-[8px] text-retro-muted mb-2">MODULE 0{ch.id}</p>
                  <h3 className={`font-pixel text-[10px] md:text-xs leading-tight mb-3
                    ${hovered === i ? 'text-retro-accent' : 'text-retro-text'}
                  `}>
                    {ch.title}
                  </h3>
                  <p className="text-sm text-retro-muted leading-tight line-clamp-3">
                    {ch.description}
                  </p>
                </div>

                {hovered === i && (
                  <div className="mt-auto pt-4 animate-pulse">
                    <span className="font-pixel text-[8px] text-retro-primary">[ CLICK TO SELECT ]</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 p-8 flex justify-between items-end">
        <div className="max-w-md">
          <p className="font-pixel text-[8px] text-retro-muted uppercase tracking-widest mb-2 opacity-60">Status: Enrolled</p>
          <div className="w-48 h-2 bg-retro-dark border border-retro-muted/30">
            <div className="h-full bg-retro-primary w-1/5 shadow-[0_0_10px_rgba(39,174,96,0.3)]" />
          </div>
        </div>

        <button 
          onClick={() => { if(hovered !== null) { audio.playSelect(); onSelect(chapters[hovered].id); } }}
          className={`
            font-pixel text-xs px-8 py-4 border-4 shadow-[6px_6px_0_rgba(0,0,0,0.1)] transition-all
            ${hovered !== null 
              ? 'bg-retro-accent text-white border-white scale-110 shadow-[8px_8px_0_var(--color-retro-primary)]' 
              : 'bg-retro-dark text-retro-muted border-retro-muted/20 opacity-50 cursor-not-allowed'}
          `}
        >
          [ ENTER ] START TERM
        </button>
      </footer>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Journal Screen
   ═══════════════════════════════════════════ */
function JournalScreen({ onClose, unlockedAlgorithms }) {
  const allAlgorithms = gameData.algorithms || []
  const [selectedAlgoIndex, setSelectedAlgoIndex] = useState(0)

  useEffect(() => {
    // Select the first unlocked algorithm by default
    const unlockedIdx = allAlgorithms.findIndex(a => unlockedAlgorithms.includes(a.id))
    if (unlockedIdx !== -1) setSelectedAlgoIndex(unlockedIdx)
  }, [allAlgorithms, unlockedAlgorithms])

  const selectedAlgo = allAlgorithms[selectedAlgoIndex]

  return (
    <div className="relative h-screen w-full bg-retro-bg font-retro flex overflow-hidden">
      <div className="absolute inset-0 scanlines opacity-10 pointer-events-none z-0" />
      
      {/* LEFT PANE: Grid */}
      <div className="w-1/2 h-full flex flex-col border-r-2 border-retro-muted relative z-10">
        <div className="p-6 border-b-2 border-retro-muted bg-white/50">
          <h1 className="font-pixel text-retro-text text-xl md:text-2xl mb-2">
            STUDENT'S ALGORITHMS JOURNAL
          </h1>
          <div className="flex items-center gap-4">
            <span className="font-pixel text-retro-primary text-xs tracking-wider">
              TOTAL COLLECTED: {unlockedAlgorithms.length} / 25
            </span>
            <div className="flex-1 h-3 bg-retro-muted/30 border border-retro-muted/50 p-[1px]">
              <div 
                className="h-full bg-retro-primary transition-all" 
                style={{ width: `${(unlockedAlgorithms.length / 25) * 100}%` }}
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
   Main Game Screen
   ═══════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState('title')
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
    setDisplayedText('')
    setTextIndex(0)
    setIsTyping(true)
  }, [node, screen])

  useEffect(() => {
    if (screen !== 'game' || !node || !isTyping) return;

    if (textIndex < node.text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(node.text.slice(0, textIndex + 1))
        audio.playTypewriter()
        setTextIndex(prev => prev + 1)
      }, 30)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [textIndex, isTyping, node, screen])

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

  if (screen === 'title') {
    return <TitleScreen onStart={(target = 'game') => setScreen(target)} />
  }

  if (screen === 'journal') {
    return <JournalScreen onClose={() => setScreen('title')} unlockedAlgorithms={unlockedAlgorithms} />
  }

  if (screen === 'chapterSelection') {
    return (
      <ChapterSelectionScreen 
        onBack={() => setScreen('title')} 
        onSelect={(chapterId) => {
          setCurrentChapter(chapterId)
          setCurrentNode('start')
          setScreen('game')
        }} 
      />
    )
  }

  if (!chapter || !node) return null

  return (
    <div className="flex h-screen w-full bg-retro-bg overflow-hidden font-retro">
      <Atmosphere showCollage={true} />

      {/* LEFT COLUMN: Narrative & Choices */}
      <div className="w-1/2 flex flex-col dialogue-panel z-10 relative">
        <header className="px-8 pt-8 pb-4 flex justify-between items-start">
          <h2 className="font-pixel text-retro-accent text-sm md:text-base glow-accent tracking-tighter uppercase">
            CHAPTER {chapter.id}: {chapter.title}
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => { audio.playSelect(); setScreen('journal'); }}
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
                  <span className="absolute -bottom-1 -right-1 text-[#ffea00] animate-pulse text-xs" style={{animationDelay: '0.2s'}}>✨</span>
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

      {/* RIGHT COLUMN: Spacer for background */}
      <div className="w-1/2 h-full pointer-events-none" />
    </div>
  )
}
