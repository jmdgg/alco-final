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
    onStart()
  }

  const menuItems = [
    { label: 'SYSTEM BOOT', action: handleStart },
    { label: 'ARCHIVES', action: () => { audio.playSelect(); setShowAbout(true); } },
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
   Main Game Screen
   ═══════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState('title')
  const [currentChapter, setCurrentChapter] = useState(1)
  const [currentNode, setCurrentNode] = useState('start')
  const [unlockedAlgorithms, setUnlockedAlgorithms] = useState([])
  const [hoveredChoice, setHoveredChoice] = useState(null)

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
    return <TitleScreen onStart={() => setScreen('game')} />
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
          <button
            onClick={() => { audio.playSelect(); setScreen('title'); }}
            className="font-pixel text-[8px] text-retro-accent hover:text-retro-primary transition-colors cursor-pointer"
          >
            ◀ MENU
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
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
