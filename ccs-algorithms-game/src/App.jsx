import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#0a0b16] overflow-hidden pointer-events-none z-0 border-l-2 border-[#3a495e]/40 shadow-2xl">
      {showCollage ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35"
          style={{ backgroundImage: 'url(/story-collage.png)', imageRendering: 'pixelated' }}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40" style={{ backgroundImage: 'url(/universal_hallway_bg.png)', imageRendering: 'pixelated' }} />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b15_1px,transparent_1px),linear-gradient(to_bottom,#64748b15_1px,transparent_1px)] bg-[size:24px_24px]" />
        </>
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
   Visual Diagram Renderer (Live Animations)
   ═══════════════════════════════════════════ */
function VisualDiagramRenderer({ algoId }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    setStep(0)
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 5)
    }, 1400)
    return () => clearInterval(timer)
  }, [algoId])

  if (algoId === "Euclid's Algorithm") {
    const steps = [
      "GCD(1920, 1080)",
      "1920 % 1080 = 840",
      "GCD(1080, 840)",
      "1080 % 840 = 240",
      "GCD(240, 120) = 120 🎉"
    ]
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs text-yellow-300 space-y-3">
        <div className="text-[#73eff7] animate-pulse">➗ EUCLID REMAINDER STEP {step + 1}/5</div>
        <div className="bg-black/60 px-6 py-3 border-2 border-[#f7d354] rounded text-sm font-bold shadow-lg">
          {steps[step]}
        </div>
      </div>
    )
  }

  if (algoId === "Factorial (Recursion)") {
    const steps = [
      "fact(4)",
      "4 * fact(3)",
      "4 * 3 * fact(2)",
      "4 * 3 * 2 * fact(1)",
      "4 * 3 * 2 * 1 = 24 ❗"
    ]
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs text-[#4ade80] space-y-3">
        <div className="text-white animate-pulse">❗ RECURSIVE STACK UNWINDING</div>
        <div className="bg-black/60 px-6 py-3 border-2 border-green-500 rounded text-sm font-bold shadow-lg">
          {steps[step]}
        </div>
      </div>
    )
  }

  if (algoId === "Max Element") {
    const scores = [85, 92, 78, 96, 88]
    const curMax = step === 0 ? 85 : step === 1 ? 92 : step === 2 ? 92 : step === 3 ? 96 : 96
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">👑 Max Element: Tracking High Score</div>
        <div className="flex gap-2 justify-center w-full">
          {scores.map((score, i) => (
            <div key={i} className={`p-3 border-2 rounded text-xs transition-all duration-300 font-bold ${score === curMax && i <= step ? 'bg-yellow-500 border-white text-black shadow-[0_0_20px_#eab308] scale-125' : i === step ? 'bg-blue-600 border-white text-white scale-110' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
              {score}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-[#8b9bb4] italic font-retro">Active max: {curMax} | Inspecting index {step}</div>
      </div>
    )
  }

  if (algoId === "Unique Elements") {
    const queue = ['dodo_ccs', 'cassie_dev', 'dodo_ccs (⚠️)', 'inigo_2026']
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#73eff7] uppercase tracking-wider animate-pulse">🛡️ Unique Elements: Set Checking</div>
        <div className="flex gap-2 justify-center w-full">
          {queue.map((user, i) => (
            <div key={i} className={`p-3 border-2 rounded text-[10px] transition-all duration-300 font-bold ${i === step && user.includes('⚠️') ? 'bg-red-500 border-white text-white shadow-[0_0_20px_#ef4444] animate-bounce scale-110' : i === step ? 'bg-[#4ade80] border-white text-black shadow-[0_0_20px_#4ade80] scale-110' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
              {user}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-[#8b9bb4] italic font-retro">{step === 2 ? 'Duplicate username detected!' : 'Adding username to seen Set'}</div>
      </div>
    )
  }

  if (algoId === "Consecutive Integer Check") {
    const checkNum = 1080 - step * 120
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs text-yellow-300 space-y-3">
        <div className="text-[#f7d354] uppercase animate-pulse">🔢 Consecutive Integer GCD Brute Force</div>
        <div className="bg-black/60 px-6 py-3 border-2 border-[#3a495e] rounded text-sm font-bold shadow-lg">
          t = {checkNum} {checkNum === 120 ? '✅ (Divides both 1920 & 1080!)' : '❌ (Fails divisibility)'}
        </div>
      </div>
    )
  }

  if (algoId === "Middle School Procedure") {
    const primesA = "1920 = 2⁷ × 3 × 5"
    const primesB = "1080 = 2³ × 3³ × 5"
    const gcdRes = "Common = 2³ × 3 × 5 = 120"
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs text-[#73eff7] space-y-2">
        <div className="text-[#73eff7] uppercase animate-pulse">🌲 Prime Factorization Intersection</div>
        <div className="bg-black/60 p-3 border border-[#3a495e] rounded text-[11px] font-bold text-center space-y-1 w-full max-w-xs">
          <div className="text-gray-300">{primesA}</div>
          <div className="text-gray-300">{primesB}</div>
          <div className="text-green-400 pt-1 border-t border-[#3a495e]">{gcdRes}</div>
        </div>
      </div>
    )
  }

  if (algoId === "Sequential Search") {
    const jeeps = ['Cubao', 'SM North', 'Alco Diner', 'Ayala', 'Fairview']
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">🛺 Sequential Search: Scanning Terminal...</div>
        <div className="flex gap-2 justify-center w-full">
          {jeeps.map((route, i) => (
            <div key={i} className={`p-3 border-2 rounded text-xs transition-all duration-300 font-bold ${i === step ? 'bg-[#4ade80] border-white text-black shadow-[0_0_20px_#4ade80] scale-125' : i < step ? 'bg-[#3a495e]/40 border-gray-600 text-gray-500 opacity-50' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
              {route}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-[#8b9bb4] italic font-retro">Target: "Alco Diner" | Checking index {step}</div>
      </div>
    )
  }

  if (algoId === "Insertion Search") {
    const cards = step === 0 ? [10, 30, 40, '📥 25'] : step === 1 ? [10, 30, '📥 25', 40] : step === 2 ? [10, '📥 25', 30, 40] : [10, 25, 30, 40]
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">🗂️ Insertion Search: Flashcard Deck</div>
        <div className="flex gap-3 justify-center w-full">
          {cards.map((val, i) => (
            <div key={i} className={`p-4 border-2 rounded text-xs transition-all duration-300 font-bold ${String(val).includes('📥') ? 'bg-[#f7d354] border-white text-black shadow-[0_0_20px_#f7d354] scale-125' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
              {val}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-[#8b9bb4] italic font-retro">Inserting card 25 into sorted order</div>
      </div>
    )
  }

  if (algoId === "BF String Matching") {
    const text = "ALCO_GAME"
    const pat = "GAME"
    const shift = step > 4 ? 4 : step
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4 font-mono">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">⚔️ BF String Matching: Sliding Window</div>
        <div className="space-y-2 text-center text-sm tracking-widest bg-black/60 p-4 border border-[#3a495e] rounded">
          <div className="text-white font-bold">{text}</div>
          <div className="text-[#73eff7] transition-all duration-300" style={{ transform: `translateX(${shift * 12}px)` }}>
            {pat} {shift === 4 && '✅'}
          </div>
        </div>
        <div className="text-[10px] text-[#8b9bb4] italic font-retro">Shift = {shift} {shift === 4 ? '(Exact Pattern Match!)' : '(Mismatch)'}</div>
      </div>
    )
  }

  if (algoId === "Interpolation Search") {
    const arr = [10, 20, 30, 40, 50, 60, 70, 80]
    const target = 70
    const estPos = step === 0 ? 3 : step === 1 ? 5 : 6 // probing directly to index 6
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">🎯 Interpolation Search: Probing Target</div>
        <div className="flex gap-2 justify-center w-full">
          {arr.map((num, i) => (
            <div key={i} className={`p-3 border-2 rounded text-xs transition-all duration-300 font-bold ${i === estPos && num === target ? 'bg-[#4ade80] border-white text-black shadow-[0_0_20px_#4ade80] scale-125' : i === estPos ? 'bg-[#73eff7] border-white text-black scale-110' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
              {num}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-[#8b9bb4] italic font-retro">
          Target: 70 | Probed Pos: {estPos} {estPos === 6 ? '✅ (Match found!)' : '(Interpolating...)'}
        </div>
        <div className="bg-black/60 px-4 py-1.5 border border-[#3a495e] rounded text-[9px] text-[#73eff7] font-mono">
          pos = low + [(target - arr[low]) * (high - low)] / (arr[high] - arr[low])
        </div>
      </div>
    )
  }

  if (algoId?.includes("Search")) {
    const arr = [12, 24, 35, 47, 58, 69, 72, 85]
    const midIdx = step === 0 ? 3 : step === 1 ? 5 : 4 // narrowing to 58
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">🔍 {algoId} in progress...</div>
        <div className="flex gap-2.5 justify-center w-full">
          {arr.map((num, i) => (
            <div key={i} className={`p-3 border-2 rounded text-xs transition-all duration-300 font-bold ${i === midIdx ? 'bg-[#4ade80] border-white text-black shadow-[0_0_20px_#4ade80] scale-125' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
              {num}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-[#8b9bb4] italic font-retro">Target: 58 | Pointer at index {midIdx}</div>
      </div>
    )
  }

  if (algoId === "Merge Sort") {
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4 font-mono">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">🔀 Merge Sort: Divide & Conquer</div>
        {step < 2 ? (
          <div className="space-y-2 text-center">
            <div className="text-[10px] text-[#8b9bb4]">Step 1: Divide into Subarrays</div>
            <div className="flex gap-6 justify-center">
              <div className="bg-[#1a1c2c] p-2 border-2 border-[#3a495e] rounded flex gap-1.5">
                <span className="p-1.5 bg-black text-white rounded">38</span>
                <span className="p-1.5 bg-black text-white rounded">27</span>
              </div>
              <div className="bg-[#1a1c2c] p-2 border-2 border-[#3a495e] rounded flex gap-1.5">
                <span className="p-1.5 bg-black text-white rounded">43</span>
                <span className="p-1.5 bg-black text-white rounded">3</span>
              </div>
            </div>
          </div>
        ) : step < 4 ? (
          <div className="space-y-2 text-center">
            <div className="text-[10px] text-[#f7d354]">Step 2: Recursive Sort Subarrays</div>
            <div className="flex gap-6 justify-center">
              <div className="bg-yellow-950/40 p-2 border-2 border-[#f7d354] rounded flex gap-1.5">
                <span className="p-1.5 bg-[#2c2f44] text-[#f7d354] rounded font-bold">27</span>
                <span className="p-1.5 bg-[#2c2f44] text-[#f7d354] rounded font-bold">38</span>
              </div>
              <div className="bg-yellow-950/40 p-2 border-2 border-[#f7d354] rounded flex gap-1.5">
                <span className="p-1.5 bg-[#2c2f44] text-[#f7d354] rounded font-bold">3</span>
                <span className="p-1.5 bg-[#2c2f44] text-[#f7d354] rounded font-bold">43</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <div className="text-[10px] text-[#4ade80]">Step 3: Stably Merge Halves</div>
            <div className="bg-green-950/40 p-3 border-2 border-[#4ade80] rounded flex gap-2 justify-center shadow-[0_0_20px_rgba(74,222,128,0.2)]">
              <span className="p-1.5 bg-[#4ade80] text-black font-bold rounded">3</span>
              <span className="p-1.5 bg-[#4ade80] text-black font-bold rounded">27</span>
              <span className="p-1.5 bg-[#4ade80] text-black font-bold rounded">38</span>
              <span className="p-1.5 bg-[#4ade80] text-black font-bold rounded">43</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (algoId === "Quicksort") {
    const leftArr = step === 0 ? [] : step === 1 ? [33, 15] : step === 2 ? [33, 15] : step === 3 ? [33, 15, 19] : [33, 15, 19]
    const rightArr = step === 0 ? [] : step === 1 ? [] : step === 2 ? [62] : step === 3 ? [62] : [62, 85]
    const status = step === 0 ? "Selecting Pivot = 42" : step === 1 ? "Inspecting 33 & 15 (< 42) → Left" : step === 2 ? "Inspecting 62 (> 42) → Right" : step === 3 ? "Inspecting 19 (< 42) → Left" : "Partition complete! [Left] + 42 + [Right]"
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4 font-mono">
        <div className="text-[#73eff7] uppercase tracking-wider animate-pulse">⚡ Quicksort: Pivot Partitioning</div>
        <div className="space-y-3 text-center w-full max-w-sm">
          <div className="flex justify-center items-center gap-2 text-[10px]">
            <span className="px-3 py-1 bg-black border border-[#3a495e] text-[#8b9bb4] rounded">Array: [33, 15, 62, 19, 85, 42]</span>
            <span className="px-3 py-1 bg-[#f7d354] text-black font-bold rounded shadow-md">Pivot: 42</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="bg-blue-950/40 p-2.5 border-2 border-[#73eff7] rounded text-center shadow-inner h-16 flex flex-col justify-center">
              <div className="text-[9px] text-[#73eff7] mb-1 font-bold">Left (&lt; 42)</div>
              <div className="flex gap-1 justify-center text-xs">
                {leftArr.map((n, i) => <span key={i} className="p-1 bg-[#4ade80] text-black rounded font-bold animate-pop-in">{n}</span>)}
              </div>
            </div>
            <div className="bg-red-950/40 p-2.5 border-2 border-red-500 rounded text-center shadow-inner h-16 flex flex-col justify-center">
              <div className="text-[9px] text-red-400 mb-1 font-bold">Right (&gt; 42)</div>
              <div className="flex gap-1 justify-center text-xs">
                {rightArr.map((n, i) => <span key={i} className="p-1 bg-red-500 text-white rounded font-bold animate-pop-in">{n}</span>)}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-[#f7d354] font-retro bg-black/60 px-4 py-1.5 border border-[#3a495e] rounded animate-pulse">
            {status}
          </div>
        </div>
      </div>
    )
  }

  if (algoId === "Heapsort") {
    const rootVal = step === 0 ? 96 : step === 1 ? 96 : step === 2 ? 72 : step === 3 ? 85 : 85
    const leftVal = step < 3 ? 85 : 72
    const sortedArr = step === 0 ? [] : step < 4 ? [96] : [85, 96]
    const status = step === 0 ? "Max-Heap Built [96, 85, 72]" : step === 1 ? "📥 Extracting Max Root (96)" : step === 2 ? "🔄 Leaf 72 moved to root (⚠️ Violation)" : step === 3 ? "⚡ Heapify: Swapping 85 & 72" : "📥 Extracting Max Root (85)"
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-3 w-full px-4">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">🌲 Heapsort: Max-Heap Extraction</div>
        <div className="flex flex-col items-center gap-1.5 my-1">
          {/* Max Heap Tree representation */}
          <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-md ${step === 1 || step === 4 ? 'bg-[#4ade80] border-white text-black scale-125 shadow-[0_0_20px_#4ade80]' : step === 2 ? 'bg-red-500 border-white text-white animate-bounce' : 'bg-[#f7d354] border-white text-black'}`}>
            {rootVal}
          </div>
          <div className="flex gap-12 items-center">
            <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 ${step === 3 ? 'bg-[#f7d354] border-white text-black scale-110' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
              {leftVal}
            </div>
            {step < 2 && (
              <div className="w-9 h-9 rounded-full bg-[#1a1c2c] border-2 border-[#3a495e] flex items-center justify-center text-[#8b9bb4] font-bold">
                72
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-black/60 px-4 py-1.5 border border-[#3a495e] rounded text-[10px]">
          <span className="text-[#73eff7]">Sorted:</span>
          <div className="flex gap-1">
            {sortedArr.map((n, i) => <span key={i} className="px-1.5 py-0.5 bg-[#4ade80] text-black rounded font-bold animate-pop-in">{n}</span>)}
          </div>
        </div>
        <div className="text-[10px] text-[#f7d354] font-retro italic">
          {status}
        </div>
      </div>
    )
  }

  if (algoId?.includes("Sort")) {
    const bars = step === 0 ? [40, 10, 30, 20] : step === 1 ? [10, 40, 30, 20] : step === 2 ? [10, 30, 40, 20] : step === 3 ? [10, 20, 30, 40] : [10, 20, 30, 40]
    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-8">
        <div className="text-[#73eff7] uppercase tracking-wider animate-pulse">🔄 {algoId} live sorting</div>
        <div className="flex items-end gap-3 h-24 bg-black/50 p-4 border-2 border-[#3a495e] rounded w-64 justify-center shadow-inner">
          {bars.map((h, i) => (
            <div key={i} style={{ height: `${h}%` }} className="w-8 bg-[#f7d354] border-2 border-white transition-all duration-500 flex items-center justify-center text-[10px] text-black font-bold shadow-md">
              {h}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (algoId === "DFS" || algoId === "BFS") {
    const isDFS = algoId === "DFS"
    const activeNodes = isDFS
      ? (step === 0 ? ['A'] : step === 1 ? ['A', 'B'] : step === 2 ? ['A', 'B', 'D'] : step === 3 ? ['A', 'B', 'D', 'C'] : ['A', 'B', 'D', 'C', 'E'])
      : (step === 0 ? ['A'] : step === 1 ? ['A', 'B'] : step === 2 ? ['A', 'B', 'C'] : step === 3 ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E'])

    const status = isDFS
      ? (step === 0 ? "📍 Start at Root (A)" : step === 1 ? "📍 Dive deep Left to (B)" : step === 2 ? "📍 Dive deepest to leaf (D)" : step === 3 ? "↩️ Backtrack up, visit Right (C)" : "📍 Dive to leaf (E). DFS Complete!")
      : (step === 0 ? "🌊 Layer 0: Start at Root (A)" : step === 1 ? "🌊 Layer 1: Visit Left neighbor (B)" : step === 2 ? "🌊 Layer 1: Visit Right neighbor (C)" : step === 3 ? "🌊 Layer 2: Visit child (D)" : "🌊 Layer 2: Visit child (E). BFS Complete!")

    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">🕸️ {algoId}: Graph Traversal</div>
        <div className="flex flex-col items-center gap-3 relative my-1 w-64 h-[144px]">
          {/* Connecting SVG Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* A -> B */}
            <line x1="128" y1="20" x2="76" y2="72" stroke={activeNodes.includes('B') ? "#4ade80" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
            {/* A -> C */}
            <line x1="128" y1="20" x2="180" y2="72" stroke={activeNodes.includes('C') ? "#4ade80" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
            {/* B -> D */}
            <line x1="76" y1="72" x2="76" y2="124" stroke={activeNodes.includes('D') ? "#4ade80" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
            {/* C -> E */}
            <line x1="180" y1="72" x2="180" y2="124" stroke={activeNodes.includes('E') ? "#4ade80" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
          </svg>

          {/* Layer 0: Root */}
          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md relative z-10 ${activeNodes.includes('A') ? 'bg-[#4ade80] border-white text-black scale-110 shadow-[0_0_15px_#4ade80]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
            A
          </div>
          {/* Layer 1: B & C */}
          <div className="flex gap-16 items-center relative z-10">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md ${activeNodes.includes('B') ? 'bg-[#4ade80] border-white text-black scale-110 shadow-[0_0_15px_#4ade80]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
              B
            </div>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md ${activeNodes.includes('C') ? 'bg-[#4ade80] border-white text-black scale-110 shadow-[0_0_15px_#4ade80]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
              C
            </div>
          </div>
          {/* Layer 2: D & E */}
          <div className="flex gap-16 items-center relative z-10">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md ${activeNodes.includes('D') ? 'bg-[#4ade80] border-white text-black scale-110 shadow-[0_0_15px_#4ade80]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
              D
            </div>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md ${activeNodes.includes('E') ? 'bg-[#4ade80] border-white text-black scale-110 shadow-[0_0_15px_#4ade80]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>
              E
            </div>
          </div>
        </div>
        <div className="bg-black/60 px-4 py-1.5 border border-[#3a495e] rounded text-[10px] text-[#73eff7] font-retro italic">
          {status}
        </div>
      </div>
    )
  }

  if (algoId === "Prim's Algorithm") {
    const activeNodes = step === 0 ? ['A'] : step === 1 ? ['A', 'B'] : step === 2 ? ['A', 'B'] : step === 3 ? ['A', 'B', 'D'] : ['A', 'B', 'D', 'C']
    const activeEdges = step === 0 ? [] : step < 3 ? ['AB'] : step === 3 ? ['AB', 'BD'] : ['AB', 'BD', 'CD']
    const status = step === 0 ? "📍 Start Workstation A. PQ: [A-B($10), A-C($20)]" : step === 1 ? "⚡ Greedily pick cheapest A-B ($10)" : step === 2 ? "🔍 PQ updated: [B-D($15), A-C($20)]" : step === 3 ? "⚡ Greedily pick cheapest B-D ($15)" : "🎉 MST Complete! Added D-C ($5). Total: $30";

    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">🛡️ Prim's Greedy Workstation Cabling</div>
        <div className="relative w-64 h-40 my-2">
          {/* Connecting SVG Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line x1="128" y1="30" x2="48" y2="80" stroke={activeEdges.includes('AB') ? "#4ade80" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
            <line x1="128" y1="30" x2="208" y2="80" stroke="#3a495e" strokeWidth="4" className="transition-all duration-500" />
            <line x1="48" y1="80" x2="128" y2="130" stroke={activeEdges.includes('BD') ? "#4ade80" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
            <line x1="208" y1="80" x2="128" y2="130" stroke={activeEdges.includes('CD') ? "#4ade80" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
          </svg>

          {/* Edge Cost Labels */}
          <span className="absolute top-8 left-16 text-[9px] bg-black px-1 text-[#f7d354] rounded border border-gray-700">$10</span>
          <span className="absolute top-8 right-16 text-[9px] bg-black px-1 text-gray-500 rounded border border-gray-700">$20</span>
          <span className="absolute bottom-8 left-16 text-[9px] bg-black px-1 text-[#f7d354] rounded border border-gray-700">$15</span>
          <span className="absolute bottom-8 right-16 text-[9px] bg-black px-1 text-[#f7d354] rounded border border-gray-700">$5</span>

          {/* Diamond Nodes */}
          <div className={`absolute top-2 left-[108px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeNodes.includes('A') ? 'bg-[#4ade80] border-white text-black scale-110 shadow-[0_0_15px_#4ade80]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>A</div>
          <div className={`absolute top-[60px] left-[28px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeNodes.includes('B') ? 'bg-[#4ade80] border-white text-black scale-110 shadow-[0_0_15px_#4ade80]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>B</div>
          <div className={`absolute top-[60px] left-[188px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeNodes.includes('C') ? 'bg-[#4ade80] border-white text-black scale-110 shadow-[0_0_15px_#4ade80]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>C</div>
          <div className={`absolute top-[110px] left-[108px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeNodes.includes('D') ? 'bg-[#4ade80] border-white text-black scale-110 shadow-[0_0_15px_#4ade80]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>D</div>
        </div>
        <div className="bg-black/60 px-4 py-2 border border-[#3a495e] rounded text-[10px] text-[#f7d354] font-retro italic text-center w-full max-w-md">
          {status}
        </div>
      </div>
    )
  }

  if (algoId === "Kruskal's Algorithm") {
    const activeEdges = step === 0 ? [] : step === 1 ? ['CD'] : step === 2 ? ['CD', 'AB'] : ['CD', 'AB', 'BD']
    const status = step === 0 ? "📋 Sorted Edges: [D-C($5), A-B($10), B-D($15), A-C($20)]" : step === 1 ? "🔗 Adding cheapest D-C ($5) to MST" : step === 2 ? "🔗 Adding A-B ($10) to MST" : step === 3 ? "🔗 Adding B-D ($15). MST Complete ($30)!" : "⚠️ Inspecting A-C ($20): Cycle detected! Discarding.";

    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#73eff7] uppercase tracking-wider animate-pulse">🔗 Kruskal's MST Edge Sorting</div>
        <div className="relative w-64 h-40 my-2">
          {/* Connecting SVG Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line x1="128" y1="30" x2="48" y2="80" stroke={activeEdges.includes('AB') ? "#73eff7" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
            <line x1="128" y1="30" x2="208" y2="80" stroke={step === 4 ? "#ef4444" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
            <line x1="48" y1="80" x2="128" y2="130" stroke={activeEdges.includes('BD') ? "#73eff7" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
            <line x1="208" y1="80" x2="128" y2="130" stroke={activeEdges.includes('CD') ? "#73eff7" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
          </svg>

          {/* Edge Cost Labels */}
          <span className="absolute top-8 left-16 text-[9px] bg-black px-1 text-[#73eff7] rounded border border-gray-700">$10</span>
          <span className="absolute top-8 right-16 text-[9px] bg-black px-1 text-gray-500 rounded border border-gray-700">$20</span>
          <span className="absolute bottom-8 left-16 text-[9px] bg-black px-1 text-[#73eff7] rounded border border-gray-700">$15</span>
          <span className="absolute bottom-8 right-16 text-[9px] bg-black px-1 text-[#73eff7] rounded border border-gray-700">$5</span>

          {/* Diamond Nodes */}
          <div className={`absolute top-2 left-[108px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeEdges.includes('AB') ? 'bg-[#73eff7] border-white text-black scale-110 shadow-[0_0_15px_#73eff7]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>A</div>
          <div className={`absolute top-[60px] left-[28px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeEdges.includes('AB') || activeEdges.includes('BD') ? 'bg-[#73eff7] border-white text-black scale-110 shadow-[0_0_15px_#73eff7]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>B</div>
          <div className={`absolute top-[60px] left-[188px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeEdges.includes('CD') ? 'bg-[#73eff7] border-white text-black scale-110 shadow-[0_0_15px_#73eff7]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>C</div>
          <div className={`absolute top-[110px] left-[108px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeEdges.includes('CD') || activeEdges.includes('BD') ? 'bg-[#73eff7] border-white text-black scale-110 shadow-[0_0_15px_#73eff7]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>D</div>
        </div>
        <div className="bg-black/60 px-4 py-2 border border-[#3a495e] rounded text-[10px] text-[#73eff7] font-retro italic text-center w-full max-w-md">
          {status}
        </div>
      </div>
    )
  }

  if (algoId?.includes("Algorithm")) {
    const activeNodes = step === 0 ? ['A'] : step === 1 ? ['A', 'C'] : step === 2 ? ['A', 'C', 'B'] : ['A', 'C', 'D']
    const activeEdges = step < 1 ? [] : step < 3 ? ['AC'] : ['AC', 'CD']
    const status = step === 0 ? "📍 Start at A. Distances: B(5m), C(2m), D(∞)" : step === 1 ? "⚡ Visit closest C(2m). Update D: 2+3 = 5m" : step === 2 ? "⚡ Visit B(5m). Path B→D (5+4=9m) is suboptimal." : "🎉 Visit D(5m). Optimal shortest path locked: A→C→D!";

    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">📍 Dijkstra's Shortest Walkway</div>
        <div className="relative w-64 h-40 my-2">
          {/* Connecting SVG Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line x1="128" y1="30" x2="48" y2="80" stroke="#3a495e" strokeWidth="4" className="transition-all duration-500" />
            <line x1="128" y1="30" x2="208" y2="80" stroke={activeEdges.includes('AC') ? "#73eff7" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
            <line x1="48" y1="80" x2="128" y2="130" stroke="#3a495e" strokeWidth="4" className="transition-all duration-500" />
            <line x1="208" y1="80" x2="128" y2="130" stroke={activeEdges.includes('CD') ? "#73eff7" : "#3a495e"} strokeWidth="4" className="transition-all duration-500" />
          </svg>

          {/* Edge Cost Labels */}
          <span className="absolute top-8 left-16 text-[9px] bg-black px-1 text-gray-500 rounded border border-gray-700">5m</span>
          <span className="absolute top-8 right-16 text-[9px] bg-black px-1 text-[#73eff7] rounded border border-gray-700">2m</span>
          <span className="absolute bottom-8 left-16 text-[9px] bg-black px-1 text-gray-500 rounded border border-gray-700">4m</span>
          <span className="absolute bottom-8 right-16 text-[9px] bg-black px-1 text-[#73eff7] rounded border border-gray-700">3m</span>

          {/* Diamond Nodes */}
          <div className={`absolute top-2 left-[108px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeNodes.includes('A') ? 'bg-[#73eff7] border-white text-black scale-110 shadow-[0_0_15px_#73eff7]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>A</div>
          <div className={`absolute top-[60px] left-[28px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeNodes.includes('B') ? 'bg-blue-500 border-white text-white scale-110' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>B</div>
          <div className={`absolute top-[60px] left-[188px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeNodes.includes('C') ? 'bg-[#73eff7] border-white text-black scale-110 shadow-[0_0_15px_#73eff7]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>C</div>
          <div className={`absolute top-[110px] left-[108px] w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md z-10 ${activeNodes.includes('D') ? 'bg-[#73eff7] border-white text-black scale-110 shadow-[0_0_15px_#73eff7]' : 'bg-[#1a1c2c] border-[#3a495e] text-[#8b9bb4]'}`}>D</div>
        </div>
        <div className="bg-black/60 px-4 py-2 border border-[#3a495e] rounded text-[10px] text-[#73eff7] font-retro italic text-center w-full max-w-md">
          {status}
        </div>
      </div>
    )
  }

  if (algoId === "Coin Row") {
    const coins = [12, 18, 14, 22]
    const pickedIdx = step === 0 ? [] : step === 1 ? [0] : step === 2 ? [1] : step === 3 ? [0, 2] : [1, 3]
    const activeSum = step === 0 ? 0 : step === 1 ? 12 : step === 2 ? 18 : step === 3 ? 26 : 40
    const status = step === 0 ? "📍 Shift list scan. dp[0] = 0" : step === 1 ? "🪙 Pick 12¢ shift. dp[1] = 12" : step === 2 ? "⚠️ Inspect 18¢. Rule prevents consecutive shifts! max(18, 12) = 18" : step === 3 ? "🪙 Pick 14¢ + 12¢ = 26¢ (vs 18¢)" : "🎉 Pick 22¢ + 18¢ = 40¢. Optimal Bonus Achieved!";

    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">🪙 Coin Row: Non-Adjacent Shift Selection</div>
        <div className="flex items-center gap-4 bg-[#1a1c2c] p-4 border-2 border-[#3a495e] rounded shadow-inner">
          {coins.map((coin, i) => {
            const isPicked = pickedIdx.includes(i)
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md ${isPicked ? 'bg-[#f7d354] border-white text-black scale-110 shadow-[0_0_15px_#f7d354]' : 'bg-[#2c2f44] border-gray-600 text-gray-400 opacity-50'}`}>
                  {coin}¢
                </div>
                {i > 0 && <span className="text-[8px] text-yellow-500 tracking-tighter">🔒 SKIP NEXT</span>}
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-3 bg-black/60 px-6 py-2 border border-[#f7d354] rounded">
          <span className="text-[#f7d354]">Current DP Max Bonus:</span>
          <span className="text-lg text-[#4ade80] font-bold">{activeSum}¢</span>
        </div>
        <div className="bg-black/60 px-4 py-1.5 border border-[#3a495e] rounded text-[10px] text-[#f7d354] font-retro italic text-center w-full max-w-md">
          {status}
        </div>
      </div>
    )
  }

  if (algoId === "Change Making") {
    const inserted = step === 0 ? [] : step === 1 ? ["25¢"] : step === 2 ? ["25¢", "10¢"] : step === 3 ? ["25¢", "10¢", "1¢"] : ["25¢", "10¢", "1¢", "1¢"]
    const total = step === 0 ? 0 : step === 1 ? 25 : step === 2 ? 35 : step === 3 ? 36 : 37
    const status = step === 0 ? "📍 Target: 37¢. dp[0] = 0" : step === 1 ? "🪙 Insert 25¢. Remainder: 12¢" : step === 2 ? "🪙 Insert 10¢. Remainder: 2¢" : step === 3 ? "🪙 Insert 1¢. Remainder: 1¢" : "🎉 Insert 1¢. Minimum 4 Coins Dispensed!";

    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#73eff7] uppercase tracking-wider animate-pulse">🏧 Change Making: Minimum Coins DP</div>
        <div className="flex flex-col items-center gap-2 bg-[#1a1c2c] p-4 border-2 border-[#3a495e] rounded w-64 shadow-inner">
          <div className="text-[10px] text-[#8b9bb4]">Coins Slot (Target: 37¢)</div>
          <div className="flex gap-2 min-h-[32px] items-center justify-center">
            {inserted.map((coin, i) => (
              <span key={i} className="px-2 py-1 bg-[#4ade80] text-black font-bold rounded shadow-md animate-pop-in">{coin}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-[#3a495e] w-full justify-between text-xs">
            <span className="text-gray-400">Total Inserted:</span>
            <span className="text-white font-bold">{total}¢</span>
          </div>
        </div>
        <div className="bg-black/60 px-4 py-1.5 border border-[#3a495e] rounded text-[10px] text-[#73eff7] font-retro italic text-center w-full max-w-md">
          {status}
        </div>
      </div>
    )
  }

  if (algoId === "Coin Collecting") {
    const path = step === 0 ? ["(0,0)=5¢"] : step === 1 ? ["(0,0)", "(0,1)=15¢"] : step === 2 ? ["(0,0)", "(0,1)", "(1,1)=35¢"] : step === 3 ? ["(0,0)", "(0,1)", "(1,1)", "(1,2)=50¢"] : ["(0,0)", "(0,1)", "(1,1)", "(1,2)", "(2,2)=75¢"]
    const status = step === 0 ? "📍 Start top-left (0,0): 5¢" : step === 1 ? "➡️ Move Right (0,1): 5+10 = 15¢" : step === 2 ? "⬇️ Move Down (1,1): 15+20 = 35¢" : step === 3 ? "➡️ Move Right (1,2): 35+15 = 50¢" : "🎉 Move Down (2,2): 50+25 = 75¢. Maximum Path Loot!";

    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4 font-mono">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">🕹️ Coin Collecting: Grid DP Traversal</div>
        <div className="grid grid-cols-3 gap-2 bg-black/60 p-3 border-2 border-[#3a495e] rounded shadow-inner">
          <div className={`p-3 border text-center font-bold rounded transition-all ${step >= 0 ? 'bg-[#f7d354] text-black' : 'text-gray-500 border-gray-700'}`}>5¢</div>
          <div className={`p-3 border text-center font-bold rounded transition-all ${step >= 1 ? 'bg-[#f7d354] text-black' : 'text-gray-500 border-gray-700'}`}>10¢</div>
          <div className="p-3 border border-gray-700 text-gray-600 text-center">0¢</div>

          <div className="p-3 border border-gray-700 text-gray-600 text-center">0¢</div>
          <div className={`p-3 border text-center font-bold rounded transition-all ${step >= 2 ? 'bg-[#f7d354] text-black' : 'text-gray-500 border-gray-700'}`}>20¢</div>
          <div className={`p-3 border text-center font-bold rounded transition-all ${step >= 3 ? 'bg-[#f7d354] text-black' : 'text-gray-500 border-gray-700'}`}>15¢</div>

          <div className="p-3 border border-gray-700 text-gray-600 text-center">0¢</div>
          <div className="p-3 border border-gray-700 text-gray-600 text-center">0¢</div>
          <div className={`p-3 border text-center font-bold rounded transition-all ${step >= 4 ? 'bg-[#4ade80] text-black shadow-[0_0_15px_#4ade80]' : 'text-gray-500 border-gray-700'}`}>25¢</div>
        </div>
        <div className="bg-black/60 px-4 py-1.5 border border-[#3a495e] rounded text-[10px] text-[#f7d354] font-retro italic text-center w-full max-w-md">
          {status}
        </div>
      </div>
    )
  }

  if (algoId === "Huffman Coding") {
    const status = step === 0 ? "🍃 Leaves: [A:5, B:9, C:12, D:13]" : step === 1 ? "⚡ Merge lowest A:5 & B:9 → N1(14)" : step === 2 ? "🌲 Updated PQ: [C:12, D:13, N1(14)]" : step === 3 ? "⚡ Merge C:12 & D:13 → N2(25)" : "🎉 Merge N1(14) & N2(25) → Root 39. Huffman Tree Complete!";

    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4 font-mono">
        <div className="text-[#4ade80] uppercase tracking-wider animate-pulse">🗜️ Huffman Coding: Priority Tree Merging</div>
        <div className="flex flex-col items-center gap-3 bg-[#1a1c2c] p-4 border-2 border-[#3a495e] rounded w-64 shadow-inner">
          <div className="flex gap-4 items-center justify-center">
            <div className={`p-2 border rounded text-xs font-bold ${step >= 4 ? 'bg-[#4ade80] text-black shadow-[0_0_15px_#4ade80]' : 'bg-[#2c2f44] text-gray-400'}`}>Root: 39</div>
          </div>
          <div className="flex gap-12 items-center justify-center pt-2 border-t border-[#3a495e] w-full">
            <div className={`p-1.5 border rounded text-[10px] font-bold ${step >= 1 ? 'bg-yellow-500 text-black' : 'bg-[#2c2f44] text-gray-400'}`}>N1: 14</div>
            <div className={`p-1.5 border rounded text-[10px] font-bold ${step >= 3 ? 'bg-yellow-500 text-black' : 'bg-[#2c2f44] text-gray-400'}`}>N2: 25</div>
          </div>
          <div className="flex gap-3 items-center justify-center pt-2 border-t border-[#3a495e] w-full text-[9px]">
            <span className="p-1 bg-black text-[#4ade80] rounded">A:5</span>
            <span className="p-1 bg-black text-[#4ade80] rounded">B:9</span>
            <span className="p-1 bg-black text-[#73eff7] rounded">C:12</span>
            <span className="p-1 bg-black text-[#73eff7] rounded">D:13</span>
          </div>
        </div>
        <div className="bg-black/60 px-4 py-1.5 border border-[#3a495e] rounded text-[10px] text-[#4ade80] font-retro italic text-center w-full max-w-md">
          {status}
        </div>
      </div>
    )
  }

  if (algoId === "Backtracking") {
    const activeNodes = step === 0 ? ['Root', 'A'] : step === 1 ? ['Root', 'A', 'A1'] : step === 2 ? ['Root', 'A'] : step === 3 ? ['Root', 'A', 'A2'] : ['Root', 'A', 'A2', 'Goal']
    const status = step === 0 ? "📍 Explore Option A. State valid." : step === 1 ? "⚠️ Explore A1: Constraint Violation Detected!" : step === 2 ? "↩️ Backtrack! Prune A1, return to A." : step === 3 ? "⚡ Explore sibling A2. State valid." : "🎉 Solution Reached via A2!";

    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4">
        <div className="text-[#73eff7] uppercase tracking-wider animate-pulse">🔂 Backtracking: Trial & Error Pruning</div>
        <div className="relative w-64 h-40 my-2 flex flex-col items-center justify-between">
          <div className="w-16 py-1 bg-[#73eff7] text-black font-bold text-center rounded text-[10px] shadow-md z-10">Root</div>

          <div className="flex w-full justify-around z-10">
            <div className={`w-14 py-1 border rounded text-center text-[10px] ${activeNodes.includes('A') ? 'bg-[#4ade80] text-black font-bold shadow-[0_0_10px_#4ade80]' : 'bg-[#1a1c2c] text-gray-500 border-gray-700'}`}>Option A</div>
          </div>

          <div className="flex w-full justify-around z-10 text-[9px]">
            <div className={`w-14 py-1 border rounded text-center ${step === 1 ? 'bg-red-500 text-white font-bold animate-shake shadow-[0_0_15px_#ef4444]' : step > 1 ? 'bg-[#1a1c2c] text-gray-700 border-red-900 line-through opacity-40' : 'bg-[#1a1c2c] text-gray-600 border-gray-800'}`}>A1 (Invalid)</div>
            <div className={`w-14 py-1 border rounded text-center ${activeNodes.includes('A2') ? 'bg-[#4ade80] text-black font-bold shadow-[0_0_10px_#4ade80]' : 'bg-[#1a1c2c] text-gray-600 border-gray-800'}`}>A2 (Valid)</div>
          </div>
        </div>
        <div className="bg-black/60 px-4 py-1.5 border border-[#3a495e] rounded text-[10px] text-[#73eff7] font-retro italic text-center w-full max-w-md">
          {status}
        </div>
      </div>
    )
  }

  if (algoId === "Branch and Bound") {
    const status = step === 0 ? "📍 Root state. Known Best Cost = $150" : step === 1 ? "⚡ Inspect Pouch A (Lower bound $120 < $150). Promising!" : step === 2 ? "⚠️ Inspect Pouch B (Lower bound $180 > $150)." : step === 3 ? "✂️ Prune entire Pouch B subtree immediately!" : "🎉 Optimal tech pack locked at $120!";

    return (
      <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-4 w-full px-4 font-mono">
        <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">✂️ Branch and Bound: Tree Pruning</div>
        <div className="flex flex-col items-center gap-4 bg-[#1a1c2c] p-4 border-2 border-[#3a495e] rounded w-64 shadow-inner">
          <div className="flex justify-between w-full px-2 text-[10px]">
            <span className="text-gray-400">Global Best Known:</span>
            <span className="text-[#f7d354] font-bold">{step >= 4 ? "$120" : "$150"}</span>
          </div>
          <div className="flex gap-4 items-center justify-around w-full pt-2 border-t border-[#3a495e]">
            <div className={`flex flex-col items-center p-2 border rounded ${step >= 1 ? 'bg-[#4ade80] text-black font-bold shadow-[0_0_15px_#4ade80]' : 'bg-[#2c2f44] text-gray-500 border-gray-700'}`}>
              <span>Pouch A</span>
              <span className="text-[9px] opacity-80">Bound: $120</span>
            </div>

            <div className={`flex flex-col items-center p-2 border rounded ${step === 2 ? 'bg-yellow-500 text-black font-bold animate-pulse' : step >= 3 ? 'bg-red-950 text-red-500 border-red-700 opacity-40 line-through' : 'bg-[#2c2f44] text-gray-500 border-gray-700'}`}>
              <span>Pouch B</span>
              <span className="text-[9px] opacity-80">Bound: $180</span>
            </div>
          </div>
        </div>
        <div className="bg-black/60 px-4 py-1.5 border border-[#3a495e] rounded text-[10px] text-[#f7d354] font-retro italic text-center w-full max-w-md">
          {status}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center font-pixel text-xs space-y-3">
      <div className="text-[#f7d354] uppercase tracking-wider animate-pulse">⚡ {algoId} Execution</div>
      <div className="w-48 h-6 bg-black/60 border-2 border-[#3a495e] rounded overflow-hidden p-1 shadow-inner">
        <div className="h-full bg-[#73eff7] transition-all duration-500 shadow-[0_0_15px_#73eff7]" style={{ width: `${(step + 1) * 20}%` }}></div>
      </div>
      <div className="text-[10px] text-[#8b9bb4]">Computing Step {step + 1}/5...</div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Algo Pixel Icon Helper
   ═══════════════════════════════════════════ */
function AlgoPixelIcon({ algoId }) {
  if (algoId?.includes("Search") || algoId?.includes("Match") || algoId?.includes("Element") || algoId?.includes("Sequential")) {
    return (
      <svg viewBox="0 0 16 16" className="w-8 h-8 fill-current text-[#73eff7]">
        <rect x="2" y="10" width="4" height="2" />
        <rect x="4" y="8" width="4" height="2" />
        <rect x="6" y="4" width="6" height="6" fill="none" stroke="#73eff7" strokeWidth="2" />
        <rect x="8" y="6" width="2" height="2" fill="#4ade80" />
      </svg>
    )
  }
  if (algoId?.includes("Sort")) {
    return (
      <svg viewBox="0 0 16 16" className="w-8 h-8 fill-current text-[#f7d354]">
        <rect x="2" y="10" width="3" height="4" />
        <rect x="6" y="6" width="3" height="8" />
        <rect x="10" y="2" width="3" height="12" fill="#4ade80" />
      </svg>
    )
  }
  if (algoId === "DFS" || algoId === "BFS" || algoId?.includes("Prim") || algoId?.includes("Kruskal") || algoId?.includes("Dijkstra")) {
    return (
      <svg viewBox="0 0 16 16" className="w-8 h-8 fill-current text-[#4ade80]">
        <rect x="6" y="2" width="4" height="4" />
        <rect x="2" y="10" width="4" height="4" />
        <rect x="10" y="10" width="4" height="4" />
        <path d="M8 6 L4 10 M8 6 L12 10" stroke="#3a495e" strokeWidth="2" />
      </svg>
    )
  }
  if (algoId?.includes("Coin") || algoId?.includes("Change") || algoId?.includes("Huffman")) {
    return (
      <svg viewBox="0 0 16 16" className="w-8 h-8 fill-current text-yellow-400">
        <rect x="4" y="4" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="6" y="6" width="4" height="4" fill="#f7d354" />
        <rect x="7" y="5" width="2" height="1" fill="#fff" />
      </svg>
    )
  }
  if (algoId?.includes("Backtracking") || algoId?.includes("Branch")) {
    return (
      <svg viewBox="0 0 16 16" className="w-8 h-8 fill-current text-[#ef4444]">
        <rect x="7" y="12" width="2" height="4" fill="#8b9bb4" />
        <rect x="4" y="6" width="8" height="6" fill="none" stroke="#ef4444" strokeWidth="2" />
        <path d="M2 2 L14 14 M14 2 L2 14" stroke="#ef4444" strokeWidth="1.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" className="w-8 h-8 fill-current text-[#73eff7]">
      <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="5" width="6" height="6" fill="#f7d354" />
      <rect x="0" y="6" width="2" height="4" />
      <rect x="14" y="6" width="2" height="4" />
      <rect x="6" y="0" width="4" height="2" />
      <rect x="6" y="14" width="4" height="2" />
    </svg>
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
                className={`journal-slot flex flex-col items-center justify-center p-2 transition-all duration-300 relative group ${isUnlocked ? 'unlocked cursor-pointer hover:scale-105' : 'locked opacity-40 cursor-not-allowed'} ${isSelected ? 'selected ring-4 ring-[#73eff7] bg-white/10 scale-105 shadow-[0_0_20px_rgba(115,239,247,0.4)]' : ''}`}
              >
                {isUnlocked ? (
                  <>
                    <div className="w-10 h-10 bg-[#111424] border-2 border-[#3a495e] flex items-center justify-center rounded shadow-[2px_2px_0px_rgba(0,0,0,0.8)] transform transition-transform group-hover:rotate-6 my-1">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <AlgoPixelIcon algoId={algo.id} />
                      </div>
                    </div>
                    <span className="font-pixel text-[8px] md:text-[9px] text-center text-[#111424] font-black mt-1 uppercase tracking-tighter leading-tight w-full px-0.5 overflow-visible whitespace-normal">
                      {algo.title}
                    </span>
                  </>
                ) : (
                  <div className="w-10 h-10 bg-black/40 border border-retro-muted flex items-center justify-center rounded">
                    <span className="font-pixel text-retro-muted text-lg opacity-50 text-center">?</span>
                  </div>
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
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#111424] border-2 border-[#3a495e] flex items-center justify-center rounded shadow-md">
                <AlgoPixelIcon algoId={selectedAlgo.id} />
              </div>
              <div>
                <h2 className="font-pixel text-[#111424] font-black text-xl md:text-2xl mb-1">{selectedAlgo.title}</h2>
                <span className="inline-block px-3 py-1 bg-retro-gold/20 text-retro-gold font-pixel text-[10px] border border-retro-gold shadow-[2px_2px_0_rgba(212,175,55,0.2)]">
                  UNLOCKED: ACHIEVEMENT
                </span>
              </div>
            </div>

            <div className="space-y-4 text-[#111424]">
              <p className="text-base md:text-lg font-semibold leading-relaxed">
                <span className="font-black block mb-1 font-pixel text-xs text-[#111424]">Definition:</span>
                {selectedAlgo.definition}
              </p>
              <p className="text-base md:text-lg font-semibold leading-relaxed">
                <span className="font-black block mb-1 font-pixel text-xs text-[#111424]">Key Use Case:</span>
                {selectedAlgo.useCase}
              </p>
            </div>

            {/* Visual Explanation Animation */}
            <div className="w-full min-h-[260px] py-8 px-4 bg-[#111424] border-4 border-[#3a495e] flex flex-col items-center justify-center relative shadow-inner rounded">
              <span className="font-pixel text-[#8b9bb4] opacity-50 text-[10px] absolute top-2 left-2 tracking-widest uppercase">VISUAL_DIAGRAM_RENDERER</span>
              <div className="w-full flex items-center justify-center z-10 pt-4 pb-2">
                <VisualDiagramRenderer algoId={selectedAlgo.id} />
              </div>
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
          focus: "➗ Euclid's, ❗ Factorials"
        },
        {
          desc: "Help Cassie validate unique login usernames, find the highest Alco quiz scorer with Mikaela, navigate jeepney terminals, search OPM karaoke books, and match RPG friend names.",
          focus: "🔍 Binary & Interpolation, ⚔️ BF String"
        },
        {
          desc: "Help Dodo organize cluttered Figma UI icons by file size, then assist Cassie, Mikaela, and Inigo in compiling and sorting a massive student management database using stable merge sort, quicksort, and heapsort.",
          focus: "🖱️ Selection, 🫧 Bubble, 🔀 Merge, ⚡ Quick, 🌲 Heap"
        },
        {
          desc: "Help Inigo find the shortest campus walkway route using Dijkstra's, assist Dodo and Cassie in wiring lab workstations efficiently with Prim's and Kruskal's MSTs, then explore Cassie's RPG character skill tree using BFS and DFS traversals.",
          focus: "📍 Dijkstra, 🛡️ Prim, 🔗 Kruskal, 🌊 BFS, 📍 DFS"
        },
        {
          desc: "Calculate optimal coin combinations at vending machines with Change Making, collect dropped bench bounties using Coin Row DP, set grid game high scores with Coin Collecting, and compress documentation files losslessly using Huffman Coding.",
          focus: "🏧 Change, 🪙 Coin Row, 🕹️ Coin Collect, 🗜️ Huffman"
        },
        {
          desc: "Debug intricate logic circuits incrementally with Backtracking exhaustive search, and pack presentation essentials optimally using Branch and Bound pruning techniques before graduation.",
          focus: "🔂 Backtracking, ✂️ Branch & Bound"
        }
      ]
      return {
        id: ch.id,
        title: ch.title,
        desc: details[index]?.desc || "Solve computer science algorithm challenges and complete AUF coursework under pressure.",
        focus: details[index]?.focus || "O-notation Complexity analysis",
        bg: "/universal_hallway_bg.png"
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

  const wheelTimeoutRef = useRef(false)
  const handleWheel = (e) => {
    if (wheelTimeoutRef.current) return
    if (e.deltaX > 25 || e.deltaY > 25) {
      wheelTimeoutRef.current = true
      handleNext()
      setTimeout(() => { wheelTimeoutRef.current = false }, 350)
    } else if (e.deltaX < -25 || e.deltaY < -25) {
      wheelTimeoutRef.current = true
      handlePrev()
      setTimeout(() => { wheelTimeoutRef.current = false }, 350)
    }
  }

  const activeChapter = chaptersList[selectedIdx]

  return (
    <div onWheel={handleWheel} className={`relative h-screen w-full overflow-hidden bg-[#111424] text-white flex flex-col items-center justify-center font-retro ${crtEffect ? 'crt-screen' : ''}`}>
      <div className="absolute inset-0 bg-[#111424]" />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: `url(${activeChapter.bg})`, imageRendering: 'pixelated' }}
      />
      <div className="absolute inset-0 bg-black/40" />
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
   Interactive Algorithm Minigame Modal
   ═══════════════════════════════════════════ */
function AlgorithmMinigameModal({ minigameData, onComplete, onClose }) {
  const { type, choice } = minigameData
  const [success, setSuccess] = useState(false)

  // Specific state for each minigame
  // 1. GCD
  const [numA, setNumA] = useState(1920)
  const [numB, setNumB] = useState(1080)

  // Chapter 1 additions (1920x1080)
  const [consecT, setConsecT] = useState(150) // checking GCD(1920, 1080) starting at 150
  const [consecError, setConsecError] = useState(null)
  const [selectedPrimes, setSelectedPrimes] = useState([])
  const [factStep, setFactStep] = useState(0)

  // Chapter 2 additions
  const [uniqueStep, setUniqueStep] = useState(0)
  const [uniqueError, setUniqueError] = useState(null)
  const uniqueQueue = useMemo(() => [
    { user: 'dodo_ccs', dup: false },
    { user: 'cassie_dev', dup: false },
    { user: 'dodo_ccs', dup: true },
    { user: 'inigo_2026', dup: false },
    { user: 'cassie_dev', dup: true }
  ], [])

  const [maxStep, setMaxStep] = useState(0)
  const [currentMax, setCurrentMax] = useState(85)
  const [maxError, setMaxError] = useState(null)
  const maxScores = useMemo(() => [85, 92, 78, 96, 88], [])

  const [seqStep, setSeqStep] = useState(0)
  const seqJeeps = useMemo(() => [
    '1. Cubao / Katipunan',
    '2. SM North / Trinoma',
    '3. Karaoke Lounge / Alco Diner',
    '4. Ayala / Makati',
    '5. Fairview / Commonwealth'
  ], [])

  const [karaokeStep, setKaraokeStep] = useState(0)
  const karaokePages = useMemo(() => [
    'Page 1: Acoustic Hits (A-C)',
    'Page 2: Ballad Classics (D-F)',
    'Page 3: Pop Anthems (G-I)',
    'Page 4: OPM Favorites (J-M)',
    'Page 5: Rock Legends (N-Z)'
  ], [])

  // 2. Binary Search
  const [arr] = useState([12, 24, 35, 47, 58, 69, 72, 85])
  const target = 58
  const [low, setLow] = useState(0)
  const [high, setHigh] = useState(7)
  const [foundMid, setFoundMid] = useState(null)

  // 2b. Interpolation Search
  const interpArr = useMemo(() => [10, 20, 30, 40, 50, 60, 70, 80], [])
  const interpTarget = 60
  const [interpPos, setInterpPos] = useState(null)

  // 2c. Insertion Search
  const sortedStack = useMemo(() => [
    'Ch 1: Morals',
    'Ch 2: Utilitarianism',
    'Ch 4: Deontology',
    'Ch 5: Virtue Ethics'
  ], [])
  const newCard = 'Ch 3: Rights Theory'
  const [insertedIdx, setInsertedIdx] = useState(null)

  // 2d. BF String Matching
  const haystack = 'SHADOWKNIGHT99'
  const needle = 'KNIGHT'
  const [patternShift, setPatternShift] = useState(0)
  const [bfError, setBfError] = useState(null)

  // 3. Sorting (Selection, Bubble, Merge, Quick, Heap)
  const [bars, setBars] = useState([45, 12, 89, 23, 67])
  const [selectionStep, setSelectionStep] = useState(0)
  const [mergeStep, setMergeStep] = useState(0)
  const [mergeLeft, setMergeLeft] = useState([12, 45])
  const [mergeRight, setMergeRight] = useState([23, 67])
  const [mergedArray, setMergedArray] = useState([])
  const [quickStep, setQuickStep] = useState(0)
  const [quickLeft, setQuickLeft] = useState([])
  const [quickRight, setQuickRight] = useState([])
  const [quickRemaining, setQuickRemaining] = useState([12, 89, 23, 67])
  const [heapStep, setHeapStep] = useState(0)
  const [heapRemaining, setHeapRemaining] = useState([89, 67, 45, 23, 12])
  const [heapSorted, setHeapSorted] = useState([])

  // 4. MST
  const [selectedEdges, setSelectedEdges] = useState([])
  const [mstError, setMstError] = useState(null)
  const edges = [
    { id: 'e1', label: 'Workstation A ── Workstation B ($10)', cost: 10, nodes: ['A', 'B'] },
    { id: 'e2', label: 'Workstation B ── Workstation D ($15)', cost: 15, nodes: ['B', 'D'] },
    { id: 'e4', label: 'Workstation C ── Workstation D ($20)', cost: 20, nodes: ['C', 'D'] },
    { id: 'e3', label: 'Workstation A ── Workstation C ($30)', cost: 30, nodes: ['A', 'C'] }
  ]

  const [dijkstraStep, setDijkstraStep] = useState(0)
  const [visitedNodes, setVisitedNodes] = useState(['Gate'])
  const [dfsStep, setDfsStep] = useState(0)
  const [dfsVisited, setDfsVisited] = useState([])
  const [bfsStep, setBfsStep] = useState(0)
  const [bfsVisited, setBfsVisited] = useState([])
  const [huffmanStep, setHuffmanStep] = useState(0)
  const [changeTotal, setChangeTotal] = useState(0)
  const [changeCoins, setChangeCoins] = useState([])
  const [changeError, setChangeError] = useState(null)
  const [coinRowSelected, setCoinRowSelected] = useState([])
  const [coinRowError, setCoinRowError] = useState(null)
  const coinRowValues = useMemo(() => [5, 12, 10, 14, 8], [])

  // 5. Coin DP (3x3 grid)
  const [pos, setPos] = useState({ r: 0, c: 0 })
  const [coinsCollected, setCoinsCollected] = useState(10)
  const gridCoins = [
    [10, 0, 25],
    [0, 50, 0],
    [15, 0, 100]
  ]

  // 6. Backtracking
  const [switches, setSwitches] = useState([false, false, false])
  const [violation, setViolation] = useState(false)
  const [backtrackHistory, setBacktrackHistory] = useState([])
  const [bbSelected, setBbSelected] = useState([])
  const [bbError, setBbError] = useState(null)
  const bbItems = useMemo(() => [
    { id: 1, name: 'Power Bank', weight: 10, value: 50 },
    { id: 2, name: 'Fast Charger', weight: 6, value: 35 },
    { id: 3, name: 'Dongle', weight: 4, value: 30 },
    { id: 4, name: 'SSD Drive', weight: 5, value: 40 }
  ], [])

  // Handlers for minigames
  const handleGcdStep = () => {
    audio.playSelect()
    if (numB === 0) return
    const rem = numA % numB
    setNumA(numB)
    setNumB(rem)
    if (rem === 0) {
      audio.playUnlock()
      setSuccess(true)
    }
  }

  const handleConsecCheck = () => {
    audio.playSelect()
    if (consecT === 120) {
      setConsecError(null)
      audio.playUnlock()
      setSuccess(true)
    } else if (consecT < 120 && 1920 % consecT === 0 && 1080 % consecT === 0) {
      audio.playPop()
      setConsecError(`t=${consecT} is a common divisor, but not the GREATEST! You skipped past t=120. Resetting back to 150!`)
      setConsecT(150)
    } else {
      audio.playPop()
      setConsecError(`t=${consecT} does not divide both 1920 and 1080. Keep decrementing!`)
    }
  }

  const handleConsecDecrement = () => {
    audio.playSelect()
    setConsecError(null)
    if (consecT > 10) setConsecT(consecT - 10)
  }

  const handlePrimeSelect = (idx) => {
    audio.playSelect()
    if (selectedPrimes.includes(idx)) return
    const nextPrimes = [...selectedPrimes, idx]
    setSelectedPrimes(nextPrimes)

    // Common primes are [2, 2, 2, 3, 5] (indices 0, 1, 2, 3, 4). All 5 must be selected!
    if (nextPrimes.length === 5) {
      audio.playUnlock()
      setSuccess(true)
    }
  }

  const handleFactStep = () => {
    audio.playSelect()
    if (factStep < 3) {
      setFactStep(factStep + 1)
      if (factStep + 1 === 3) {
        audio.playUnlock()
        setSuccess(true)
      }
    }
  }

  const handleUniqueChoice = (isDup) => {
    audio.playSelect()
    const current = uniqueQueue[uniqueStep]
    if (current.dup === isDup) {
      setUniqueError(null)
      if (uniqueStep + 1 === uniqueQueue.length) {
        audio.playUnlock()
        setSuccess(true)
      } else {
        setUniqueStep(uniqueStep + 1)
      }
    } else {
      audio.playPop()
      setUniqueError(isDup ? `User '${current.user}' is new! Do not reject them!` : `User '${current.user}' already exists! Duplicate error!`)
    }
  }

  const handleMaxChoice = (update) => {
    audio.playSelect()
    const nextScore = maxScores[maxStep + 1]
    const shouldUpdate = nextScore > currentMax

    if (update === shouldUpdate) {
      setMaxError(null)
      if (shouldUpdate) setCurrentMax(nextScore)
      if (maxStep + 1 === maxScores.length - 1) {
        audio.playUnlock()
        setSuccess(true)
      } else {
        setMaxStep(maxStep + 1)
      }
    } else {
      audio.playPop()
      setMaxError(update ? `${nextScore} is not higher than ${currentMax}! Do not update!` : `${nextScore} is higher than ${currentMax}! You must update max!`)
    }
  }

  const handleSeqChoice = () => {
    audio.playSelect()
    if (seqStep < 2) {
      setSeqStep(seqStep + 1)
      if (seqStep + 1 === 2) {
        audio.playUnlock()
        setSuccess(true)
      }
    }
  }

  const handleKaraokeChoice = () => {
    audio.playSelect()
    if (karaokeStep < 3) {
      setKaraokeStep(karaokeStep + 1)
      if (karaokeStep + 1 === 3) {
        audio.playUnlock()
        setSuccess(true)
      }
    }
  }

  const handleBinarySearchClick = (idx) => {
    audio.playSelect()
    const mid = Math.floor((low + high) / 2)
    if (idx !== mid) {
      audio.playPop() // incorrect mid
      return
    }
    if (arr[mid] === target) {
      audio.playUnlock()
      setFoundMid(mid)
      setSuccess(true)
    } else if (arr[mid] < target) {
      setLow(mid + 1)
    } else {
      setHigh(mid - 1)
    }
  }

  const handleInterpClick = (idx) => {
    audio.playSelect()
    const estimatedPos = 5 // pos = 0 + Math.floor(((60 - 10) * 7) / 70) = 5
    if (idx !== estimatedPos) {
      audio.playPop() // incorrect estimated pos
      return
    }
    if (interpArr[estimatedPos] === interpTarget) {
      audio.playUnlock()
      setInterpPos(estimatedPos)
      setSuccess(true)
    }
  }

  const handleInsertionClick = (slotIdx) => {
    audio.playSelect()
    if (slotIdx === 2) {
      audio.playUnlock()
      setInsertedIdx(2)
      setSuccess(true)
    } else {
      audio.playPop()
    }
  }

  const handleBfShift = () => {
    audio.playSelect()
    setBfError(null)
    if (patternShift < haystack.length - needle.length) {
      setPatternShift(patternShift + 1)
    }
  }

  const handleBfCheck = () => {
    audio.playSelect()
    if (patternShift === 6) { // 'SHADOW'.length is 6
      audio.playUnlock()
      setSuccess(true)
    } else {
      audio.playPop()
      setBfError(`Mismatch at Shift ${patternShift}! Character '${haystack[patternShift]}' !== '${needle[0]}'. Keep shifting!`)
    }
  }

  const handleSortSwap = (idx) => {
    audio.playSelect()
    if (idx >= bars.length - 1) return
    const nextBars = [...bars]
    const temp = nextBars[idx]
    nextBars[idx] = nextBars[idx + 1]
    nextBars[idx + 1] = temp
    setBars(nextBars)

    // Check sorted
    if (nextBars.every((val, i) => i === 0 || val >= nextBars[i - 1])) {
      audio.playUnlock()
      setSuccess(true)
    }
  }

  const handleSelectionClick = (idx) => {
    audio.playSelect()
    if (success || idx < selectionStep) return

    const unsortedSlice = bars.slice(selectionStep)
    const minVal = Math.min(...unsortedSlice)

    if (bars[idx] === minVal) {
      const nextBars = [...bars]
      const temp = nextBars[idx]
      nextBars[idx] = nextBars[selectionStep]
      nextBars[selectionStep] = temp
      setBars(nextBars)

      const nextStep = selectionStep + 1
      setSelectionStep(nextStep)

      if (nextStep >= bars.length - 1) {
        audio.playUnlock()
        setSuccess(true)
      } else {
        audio.playPop()
      }
    } else {
      audio.playPop()
    }
  }

  const handleMergeClick = (val, side) => {
    audio.playSelect()
    if (success) return

    const leftCandidate = mergeLeft[0] ?? Infinity
    const rightCandidate = mergeRight[0] ?? Infinity
    const minVal = Math.min(leftCandidate, rightCandidate)

    if (val === minVal) {
      if (side === 'left') {
        setMergeLeft(mergeLeft.slice(1))
      } else {
        setMergeRight(mergeRight.slice(1))
      }
      const nextMerged = [...mergedArray, val]
      setMergedArray(nextMerged)

      if (nextMerged.length === 4) {
        audio.playUnlock()
        setSuccess(true)
      } else {
        audio.playPop()
      }
    } else {
      audio.playPop()
    }
  }

  const handleQuickClick = (val) => {
    audio.playSelect()
    if (quickStep < 2) {
      if (val < 45) {
        setQuickLeft([...quickLeft, val])
        setQuickRemaining(quickRemaining.filter(v => v !== val))
        setQuickStep(quickStep + 1)
      } else {
        audio.playPop()
      }
    } else {
      if (val > 45) {
        const nextRight = [...quickRight, val]
        setQuickRight(nextRight)
        setQuickRemaining(quickRemaining.filter(v => v !== val))
        const nextStep = quickStep + 1
        setQuickStep(nextStep)
        if (nextStep === 4) {
          audio.playUnlock()
          setSuccess(true)
        }
      } else {
        audio.playPop()
      }
    }
  }

  const handleHeapClick = (val) => {
    audio.playSelect()
    if (success) return

    const maxVal = Math.max(...heapRemaining)
    if (val === maxVal) {
      const nextRemaining = heapRemaining.filter(v => v !== val)
      const nextSorted = [val, ...heapSorted]
      setHeapRemaining(nextRemaining)
      setHeapSorted(nextSorted)

      if (nextRemaining.length === 0) {
        audio.playUnlock()
        setSuccess(true)
      } else {
        audio.playPop()
      }
    } else {
      audio.playPop()
    }
  }

  const handleMstClick = (id) => {
    audio.playSelect()
    if (success) return

    if (selectedEdges.includes(id)) {
      setSelectedEdges(selectedEdges.filter(e => e !== id))
      setMstError(null)
      return
    }

    if (selectedEdges.length >= 3) {
      audio.playPop()
      setMstError("⚠️ You already connected 3 cables! Disconnect an expensive cable first.")
      return
    }

    const nextEdges = [...selectedEdges, id]
    setSelectedEdges(nextEdges)

    if (nextEdges.length === 3) {
      if (nextEdges.includes('e1') && nextEdges.includes('e2') && nextEdges.includes('e4')) {
        audio.playUnlock()
        setSuccess(true)
        setMstError(null)
      } else {
        audio.playPop()
        setMstError("⚠️ Suboptimal spanning tree detected! The connection A ── C ($30) is too expensive. Click connected cables to disconnect and try again!")
      }
    }
  }

  const handleDijkstraClick = (nodeName) => {
    audio.playSelect()
    if (dijkstraStep === 0 && nodeName === 'Library') {
      setDijkstraStep(1)
      setVisitedNodes(['Gate', 'Library'])
    } else if (dijkstraStep === 1 && nodeName === 'Lounge') {
      setDijkstraStep(2)
      setVisitedNodes(['Gate', 'Library', 'Lounge'])
    } else if (dijkstraStep === 2 && nodeName === 'CS Bldg') {
      setDijkstraStep(3)
      setVisitedNodes(['Gate', 'Library', 'Lounge', 'CS Bldg'])
      audio.playUnlock()
      setSuccess(true)
    } else {
      audio.playPop()
    }
  }

  const handleDfsClick = (nodeName) => {
    audio.playSelect()
    if (success) return
    const order = ['Root', 'Fire Magic', 'Inferno', 'Ice Magic', 'Frostbite']
    if (nodeName === order[dfsStep]) {
      const nextVisited = [...dfsVisited, nodeName]
      setDfsVisited(nextVisited)
      setDfsStep(dfsStep + 1)
      if (nodeName === 'Frostbite') {
        audio.playUnlock()
        setSuccess(true)
      }
    } else {
      audio.playPop()
    }
  }

  const handleBfsClick = (nodeName) => {
    audio.playSelect()
    if (success) return
    const levelOrder = ['Root', 'Fire Magic', 'Ice Magic', 'Inferno', 'Frostbite']
    if (nodeName === levelOrder[bfsStep]) {
      const nextVisited = [...bfsVisited, nodeName]
      setBfsVisited(nextVisited)
      setBfsStep(bfsStep + 1)
      if (nodeName === 'Frostbite') {
        audio.playUnlock()
        setSuccess(true)
      }
    } else {
      audio.playPop()
    }
  }

  const handleHuffmanClick = () => {
    audio.playSelect()
    if (huffmanStep < 2) {
      setHuffmanStep(huffmanStep + 1)
    } else if (huffmanStep === 2) {
      setHuffmanStep(3)
      audio.playUnlock()
      setSuccess(true)
    }
  }

  const handleDpMove = (dr, dc) => {
    audio.playSelect()
    const nr = pos.r + dr
    const nc = pos.c + dc
    if (nr < 3 && nc < 3) {
      setPos({ r: nr, c: nc })
      const collected = coinsCollected + gridCoins[nr][nc]
      setCoinsCollected(collected)
      if (nr === 2 && nc === 2) {
        audio.playUnlock()
        setSuccess(true)
      }
    }
  }

  const handleChangeCoinClick = (coinVal) => {
    audio.playSelect()
    if (success) return

    if (changeTotal + coinVal > 37) {
      audio.playPop()
      setChangeError(`⚠️ Adding ${coinVal}¢ exceeds the 37¢ price! Machine spits it back out.`)
      return
    }

    const nextTotal = changeTotal + coinVal
    const nextCoins = [...changeCoins, coinVal]
    setChangeTotal(nextTotal)
    setChangeCoins(nextCoins)

    if (nextTotal === 37) {
      if (nextCoins.length === 4) {
        audio.playUnlock()
        setSuccess(true)
        setChangeError(null)
      } else {
        audio.playPop()
        setChangeError(`⚠️ You reached 37¢ but used ${nextCoins.length} coins! Dynamic Programming optimization uses exactly 4 coins [25¢, 10¢, 1¢, 1¢]. Reset and try again!`)
      }
    }
  }

  const handleChangeReset = () => {
    audio.playSelect()
    setChangeTotal(0)
    setChangeCoins([])
    setChangeError(null)
  }

  const handleCoinRowClick = (idx) => {
    audio.playSelect()
    if (success) return

    if (coinRowSelected.includes(idx)) {
      setCoinRowSelected(coinRowSelected.filter(i => i !== idx))
      setCoinRowError(null)
      return
    }

    if (coinRowSelected.includes(idx - 1) || coinRowSelected.includes(idx + 1)) {
      audio.playPop()
      setCoinRowError("⚠️ Security laser triggered! You cannot pick two adjacent coins on the bench.")
      return
    }

    setCoinRowSelected([...coinRowSelected, idx])
    setCoinRowError(null)
  }

  const handleCoinRowCheck = () => {
    audio.playSelect()
    if (success) return

    const sum = coinRowSelected.reduce((acc, i) => acc + coinRowValues[i], 0)
    if (sum === 26) {
      audio.playUnlock()
      setSuccess(true)
      setCoinRowError(null)
    } else {
      audio.playPop()
      setCoinRowError(`⚠️ Current sum is ${sum}¢. The optimal non-adjacent sum is 26¢! Click selected coins to put them back and try again.`)
    }
  }

  const handleSwitchToggle = (idx) => {
    audio.playSelect()
    if (success) return

    // If currently in violation, player MUST backtrack (turn off switch 1)
    if (violation) {
      if (idx === 1 && switches[1]) {
        const nextSwitches = [...switches]
        nextSwitches[1] = false
        setSwitches(nextSwitches)
        setViolation(false)
        setBacktrackHistory([...backtrackHistory, 'Backtrack SW2 OFF'])
        return
      } else {
        audio.playPop()
        return
      }
    }

    const nextSwitches = [...switches]
    nextSwitches[idx] = !nextSwitches[idx]
    setSwitches(nextSwitches)
    const stateStr = `[SW1:${nextSwitches[0] ? 'ON' : 'OFF'}, SW2:${nextSwitches[1] ? 'ON' : 'OFF'}, SW3:${nextSwitches[2] ? 'ON' : 'OFF'}]`
    setBacktrackHistory([...backtrackHistory, stateStr])

    // Configuration constraint: if switch 0 and switch 1 are both true without switch 2, short circuit!
    if (nextSwitches[0] && nextSwitches[1] && !nextSwitches[2]) {
      setViolation(true)
      audio.playPop()
    } else {
      setViolation(false)
      if (nextSwitches[0] && nextSwitches[1] && nextSwitches[2]) {
        audio.playUnlock()
        setSuccess(true)
      }
    }
  }

  const handleBbClick = (id) => {
    audio.playSelect()
    if (success) return

    const item = bbItems.find(i => i.id === id)
    if (bbSelected.includes(id)) {
      setBbSelected(bbSelected.filter(i => i !== id))
      setBbError(null)
      return
    }

    const totalW = bbSelected.reduce((sum, i) => sum + bbItems.find(item => item.id === i).weight, 0) + item.weight
    if (totalW > 15) {
      audio.playPop()
      setBbError(`✂️ PRUNED! Adding ${item.name} (${item.weight} oz) exceeds the 15 oz pouch limit! Branch pruned immediately.`)
      return
    }

    setBbSelected([...bbSelected, id])
    setBbError(null)
  }

  const handleBbCheck = () => {
    audio.playSelect()
    if (success) return

    const totalV = bbSelected.reduce((sum, i) => sum + bbItems.find(item => item.id === i).value, 0)
    if (totalV === 105) {
      audio.playUnlock()
      setSuccess(true)
      setBbError(null)
    } else {
      audio.playPop()
      setBbError(`⚠️ Current load value is $${totalV}. The optimal pruned load value is $105! Prune suboptimal combinations and try again.`)
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-[#1a1c2c] border-4 border-[#f7d354] p-8 max-w-3xl w-full shadow-[0_15px_35px_rgba(0,0,0,0.8)] animate-pop-in font-retro text-white relative">
        {/* Header */}
        <h2 className="font-pixel text-[#f7d354] text-center text-sm md:text-lg mb-2 uppercase tracking-widest text-shadow-md flex items-center justify-center gap-2">
          <span>🕹️</span> [ ALGORITHM MINIGAME ]
        </h2>
        <p className="font-retro text-xs md:text-sm text-[#f7d354] font-bold text-center mb-1">
          {choice.label}
        </p>
        <p className="font-retro text-xs md:text-sm text-[#8b9bb4] text-center mb-6 leading-relaxed">
          Execute the algorithm steps correctly to optimize computational performance!
        </p>

        {/* Content based on minigame type */}
        <div className="my-6 min-h-[200px] flex flex-col items-center justify-center bg-[#10121c] border border-[#3a495e] p-6 rounded-sm">
          {type === 'gcd' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">Euclid's GCD Algorithm</p>
              <div className="flex justify-center items-center gap-6 font-pixel text-xl py-4 bg-[#1a1c2c] border border-[#3a495e] rounded-sm">
                <div>A: <span className="text-[#4ade80]">{numA}</span></div>
                <div>%</div>
                <div>B: <span className="text-[#f7d354]">{numB}</span></div>
              </div>
              {!success ? (
                <button
                  onClick={handleGcdStep}
                  className="btn-pixel-menu py-3 px-8 text-sm md:text-base uppercase cursor-pointer"
                >
                  Step: A = B, B = A % B
                </button>
              ) : (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base animate-pulse">🎉 GCD Found: {numA}! Perfectly aligned!</div>
              )}
            </div>
          )}

          {type === 'consecutive_check' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">Consecutive Integer Check GCD</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">Find GCD(1920, 1080). Dodo checks from t = 150 downwards! Does t divide both 1920 and 1080?</p>
              <div className="flex justify-center items-center gap-6 font-pixel text-xl py-3 bg-[#1a1c2c] border border-[#3a495e] rounded-sm">
                <div>Testing t = <span className="text-[#f7d354]">{consecT}</span></div>
              </div>
              <div className="flex justify-center gap-4 pt-2 font-pixel">
                <button onClick={handleConsecCheck} disabled={success} className="btn-pixel-menu py-3 px-6 text-xs md:text-sm cursor-pointer">
                  CHECK DIVISIBILITY
                </button>
                <button onClick={handleConsecDecrement} disabled={success} className="py-3 px-6 bg-[#2c2f44] border border-[#3a495e] hover:border-white text-xs md:text-sm cursor-pointer">
                  DECREMENT t = t - 10
                </button>
              </div>
              {consecError && !success && (
                <div className="text-red-400 font-pixel text-xs md:text-sm animate-bounce bg-red-950/40 p-3 border border-red-800 rounded-sm">
                  ⚠️ {consecError}
                </div>
              )}
              {success && (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base pt-2 animate-pulse">🎉 Divisibility confirmed! GCD is {consecT}! Buttons fit perfectly!</div>
              )}
            </div>
          )}

          {type === 'middle_school' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">Middle School Procedure GCD</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">Prime factors of 1920 = [2⁷ × 3 × 5]. Prime factors of 1080 = [2³ × 3³ × 5]. Select the shared common prime factors [2, 2, 2, 3, 5] to multiply!</p>
              <div className="flex justify-center gap-4 pt-4 font-pixel text-sm md:text-base">
                {[2, 2, 2, 3, 5].map((val, idx) => {
                  const isSel = selectedPrimes.includes(idx);
                  return (
                    <button
                      key={idx}
                      disabled={success || isSel}
                      onClick={() => handlePrimeSelect(idx)}
                      className={`py-3 px-6 border-2 text-center transition-all cursor-pointer ${isSel ? 'bg-[#27ae60] border-white text-white shadow-md' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354]'}`}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
              {success && (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base mt-2 animate-pulse">🎉 Shared primes multiplied! 2 × 2 × 2 × 3 × 5 = 120! Perfectly square buttons!</div>
              )}
            </div>
          )}

          {type === 'factorial' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">Factorial Recursion Tree</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">Inigo has 4 morning tasks. Calculate total permutations fact(4) by expanding the recursive calls until the base case fact(1) = 1!</p>
              <div className="bg-[#1a1c2c] border border-[#3a495e] p-4 rounded-sm font-pixel text-sm md:text-base space-y-2">
                <div className="text-[#f7d354]">fact(4) = 4 × fact(3)</div>
                {factStep >= 1 && <div className="text-[#4ade80]">fact(3) = 3 × fact(2)</div>}
                {factStep >= 2 && <div className="text-[#60a5fa]">fact(2) = 2 × fact(1)</div>}
                {factStep >= 3 && <div className="text-[#f7d354] pt-2 border-t border-[#3a495e]">Result: 4 × 3 × 2 × 1 = 24 combinations!</div>}
              </div>
              {!success ? (
                <button onClick={handleFactStep} className="btn-pixel-menu py-3 px-6 text-xs md:text-sm cursor-pointer">
                  EXPAND RECURSIVE CALL 🔄
                </button>
              ) : (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base animate-pulse pt-2">🎉 Recursion resolved perfectly! 24 permutations calculated!</div>
              )}
            </div>
          )}

          {type === 'unique_elements' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">UniqueElements User Validation</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">Cassie needs to prevent duplicate registrations. Inspect incoming username: click ACCEPT for new users, and REJECT for duplicate registrations!</p>
              <div className="flex justify-center items-center gap-6 font-pixel text-xl py-4 bg-[#1a1c2c] border border-[#3a495e] rounded-sm">
                <div>User Queue [{uniqueStep + 1}/{uniqueQueue.length}]: <span className="text-[#f7d354]">{uniqueQueue[uniqueStep]?.user}</span></div>
              </div>
              <div className="flex justify-center gap-4 pt-2 font-pixel">
                <button onClick={() => handleUniqueChoice(false)} disabled={success} className="btn-pixel-menu py-3 px-8 text-sm md:text-base cursor-pointer">
                  ACCEPT (UNIQUE) ✅
                </button>
                <button onClick={() => handleUniqueChoice(true)} disabled={success} className="py-3 px-8 bg-[#2c2f44] border border-[#3a495e] hover:border-red-400 text-sm md:text-base hover:text-red-400 cursor-pointer">
                  REJECT (DUPLICATE) ❌
                </button>
              </div>
              {uniqueError && !success && (
                <div className="text-red-400 font-pixel text-xs md:text-sm animate-bounce bg-red-950/40 p-3 border border-red-800 rounded-sm">
                  ⚠️ {uniqueError}
                </div>
              )}
              {success && (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base pt-2 animate-pulse">🎉 All incoming registrations validated perfectly! No duplicates!</div>
              )}
            </div>
          )}

          {type === 'max_element' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">MaxElement Quiz High Score</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">Iterate through Alco quiz scores [85, 92, 78, 96, 88]. Keep track of current Max O(N). Update max if the next score is strictly greater!</p>
              <div className="flex justify-center items-center gap-8 font-pixel text-xl py-4 bg-[#1a1c2c] border border-[#3a495e] rounded-sm">
                <div>Current Max: <span className="text-[#4ade80]">{currentMax}</span></div>
                <div>Next Score: <span className="text-[#f7d354]">{maxScores[maxStep + 1]}</span></div>
              </div>
              <div className="flex justify-center gap-4 pt-2 font-pixel">
                <button onClick={() => handleMaxChoice(true)} disabled={success} className="btn-pixel-menu py-3 px-8 text-sm md:text-base cursor-pointer">
                  UPDATE MAX ⬆️
                </button>
                <button onClick={() => handleMaxChoice(false)} disabled={success} className="py-3 px-8 bg-[#2c2f44] border border-[#3a495e] hover:border-white text-sm md:text-base cursor-pointer">
                  KEEP CURRENT ⏸️
                </button>
              </div>
              {maxError && !success && (
                <div className="text-red-400 font-pixel text-xs md:text-sm animate-bounce bg-red-950/40 p-3 border border-red-800 rounded-sm">
                  ⚠️ {maxError}
                </div>
              )}
              {success && (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base pt-2 animate-pulse">🎉 Highest score 96 located in O(N) single pass! Goodbye Dodo's allowance!</div>
              )}
            </div>
          )}

          {type === 'sequential_search' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">Sequential Search (Parked Jeepneys)</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">The parked jeepneys arrived in random order. Inspect their route signboards linearly from start to finish until you find 'Karaoke Lounge / Alco Diner'!</p>
              <div className="flex justify-center items-center gap-6 font-pixel text-lg py-4 bg-[#1a1c2c] border border-[#3a495e] rounded-sm">
                <div>Jeepney Signboard [{seqStep + 1}/5]: <span className="text-[#f7d354]">{seqJeeps[seqStep]}</span></div>
              </div>
              {!success ? (
                <button onClick={handleSeqChoice} className="btn-pixel-menu py-3 px-8 text-sm md:text-base cursor-pointer">
                  INSPECT NEXT JEEPNEY 🚙
                </button>
              ) : (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base animate-pulse pt-2">🎉 Destination located at Index 2! Hop on the jeepney to the karaoke spot!</div>
              )}
            </div>
          )}

          {type === 'sequential_search_karaoke' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">Sequential Search (Karaoke Songbook)</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">Inigo flips through the massive songbook page by page from the beginning. Inspect each page sequentially until you locate Inigo's OPM song!</p>
              <div className="flex justify-center items-center gap-6 font-pixel text-lg py-4 bg-[#1a1c2c] border border-[#3a495e] rounded-sm">
                <div>Songbook [{karaokeStep + 1}/5]: <span className="text-[#f7d354]">{karaokePages[karaokeStep]}</span></div>
              </div>
              {!success ? (
                <button onClick={handleKaraokeChoice} className="btn-pixel-menu py-3 px-8 text-sm md:text-base cursor-pointer">
                  FLIP TO NEXT PAGE 📖
                </button>
              ) : (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base animate-pulse pt-2">🎉 OPM song located at Page 4! Time for Inigo to sing!</div>
              )}
            </div>
          )}

          {type === 'binary_search' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Binary Search'} for Target: <span className="text-[#f7d354]">{target}</span></p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">Click the middle element (Index {Math.floor((low + high) / 2)}) of the current search bounds!</p>
              <div className="grid grid-cols-4 gap-3 pt-2">
                {arr.map((val, idx) => {
                  const inBounds = idx >= low && idx <= high;
                  return (
                    <button
                      key={idx}
                      disabled={!inBounds || success}
                      onClick={() => handleBinarySearchClick(idx)}
                      className={`font-pixel text-sm md:text-base py-3 border-2 text-center transition-all ${success && foundMid === idx ? 'bg-[#27ae60] border-white text-white animate-bounce' : inBounds ? 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-white cursor-pointer' : 'bg-black/40 border-black/40 text-gray-700 opacity-30 line-through'}`}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
              {success && (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base mt-4 animate-pulse">🎉 Target {target} located at O(log N) speed!</div>
              )}
            </div>
          )}

          {type === 'interpolation_search' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Interpolation Search'} for Target: <span className="text-[#f7d354]">{interpTarget}</span></p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                Formula: <code className="bg-black/40 px-2 py-0.5 rounded text-[#73eff7]">pos = low + floor(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]))</code><br />
                Plugging in: <code className="bg-black/40 px-2 py-0.5 rounded text-[#4ade80]">0 + floor(((60 - 10) * 7) / 70) = Index 5</code>.<br />
                Click estimated Index 5 (Song Code 60) to instantly match Inigo's OPM song!
              </p>
              <div className="grid grid-cols-4 gap-3 pt-2">
                {interpArr.map((val, idx) => {
                  return (
                    <button
                      key={idx}
                      disabled={success}
                      onClick={() => handleInterpClick(idx)}
                      className={`font-pixel text-sm md:text-base py-3 border-2 text-center transition-all ${success && interpPos === idx ? 'bg-[#27ae60] border-white text-white animate-bounce shadow-lg' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-white cursor-pointer'}`}
                    >
                      <span className="block text-[10px] text-[#8b9bb4] mb-1">Index {idx}</span>
                      <span>{val}</span>
                    </button>
                  )
                })}
              </div>
              {success && (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base mt-4 animate-pulse">🎉 Target {interpTarget} located instantly using value estimation!</div>
              )}
            </div>
          )}

          {type === 'insertion_search' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Insertion Search'} (Flashcard Stack)</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? "Dodo wants to insert his new flashcard [Ch 3: Rights Theory] into his sorted stack. Click the correct insert slot index so the stack remains perfectly sorted!" : "Flashcards ordered successfully!"}
              </p>

              <div className="bg-[#10121c] border border-[#3a495e] p-4 rounded max-w-md mx-auto space-y-3">
                <div className="p-3 bg-yellow-950/40 border border-yellow-600 rounded text-[#f7d354] text-xs font-bold animate-pulse">
                  🗂️ New Card to Insert: {newCard}
                </div>

                <div className="flex flex-col gap-2 pt-2 text-xs">
                  <div onClick={() => handleInsertionClick(0)} className="py-1 border border-dashed border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer transition-all">
                    Slot Index 0
                  </div>
                  <div className="py-2 bg-[#2c2f44] border border-[#3a495e] rounded text-white">{sortedStack[0]}</div>

                  <div onClick={() => handleInsertionClick(1)} className="py-1 border border-dashed border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer transition-all">
                    Slot Index 1
                  </div>
                  <div className="py-2 bg-[#2c2f44] border border-[#3a495e] rounded text-white">{sortedStack[1]}</div>

                  <div onClick={() => handleInsertionClick(2)} className={`py-1 border border-dashed transition-all ${insertedIdx === 2 ? 'bg-[#27ae60] border-white text-white font-bold' : 'border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer'}`}>
                    {insertedIdx === 2 ? `Slot Index 2 ✅ [${newCard} Inserted]` : 'Slot Index 2'}
                  </div>
                  <div className="py-2 bg-[#2c2f44] border border-[#3a495e] rounded text-white">{sortedStack[2]}</div>

                  <div onClick={() => handleInsertionClick(3)} className="py-1 border border-dashed border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer transition-all">
                    Slot Index 3
                  </div>
                  <div className="py-2 bg-[#2c2f44] border border-[#3a495e] rounded text-white">{sortedStack[3]}</div>

                  <div onClick={() => handleInsertionClick(4)} className="py-1 border border-dashed border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer transition-all">
                    Slot Index 4
                  </div>
                </div>
              </div>

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 Flashcard stack maintained in perfect sorted order!</div>
              )}
            </div>
          )}

          {type === 'bf_string_matching' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'BF String Matching'} (Guild Search)</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? `Shift the pattern '${needle}' right to align it with the matching substring in haystack '${haystack}'!` : "Pattern matched successfully!"}
              </p>

              <div className="bg-[#10121c] border border-[#3a495e] px-2 py-6 md:p-6 rounded max-w-2xl mx-auto space-y-6 overflow-x-auto text-xs md:text-sm">
                <div className="flex gap-1 md:gap-2 justify-center font-mono font-bold tracking-widest text-white">
                  {haystack.split('').map((char, i) => (
                    <span key={i} className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center border rounded flex-shrink-0 ${success && i >= 6 && i < 12 ? 'bg-[#27ae60] border-white text-white shadow-lg animate-bounce' : 'bg-[#2c2f44] border-[#3a495e]'}`}>
                      {char}
                    </span>
                  ))}
                </div>

                <div className="flex gap-1 md:gap-2 justify-center font-mono font-bold tracking-widest text-[#f7d354]">
                  {haystack.split('').map((_, i) => {
                    const charIdx = i - patternShift;
                    const char = (charIdx >= 0 && charIdx < needle.length) ? needle[charIdx] : '';
                    return (
                      <span key={i} className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center border rounded flex-shrink-0 transition-all ${char ? (success ? 'bg-[#27ae60] border-white text-white shadow-lg animate-bounce' : 'bg-yellow-950/40 border-yellow-600') : 'border-transparent bg-transparent'}`}>
                        {char}
                      </span>
                    )
                  })}
                </div>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button onClick={handleBfShift} disabled={success || patternShift >= haystack.length - needle.length} className="btn-pixel-menu py-3 px-6 text-xs cursor-pointer disabled:opacity-30">
                    SHIFT PATTERN RIGHT ➡️
                  </button>
                  <button onClick={handleBfCheck} disabled={success} className="py-3 px-6 bg-[#27ae60] border border-white hover:border-[#f7d354] text-white text-xs cursor-pointer shadow-md">
                    CHECK MATCH 🔍
                  </button>
                  {patternShift > 0 && !success && (
                    <button onClick={() => { audio.playSelect(); setPatternShift(0); setBfError(null); }} className="py-3 px-6 bg-red-900 border border-white hover:border-[#f7d354] text-white text-xs cursor-pointer shadow-md">
                      RESET SHIFT 🔄
                    </button>
                  )}
                </div>

                {bfError && !success && (
                  <div className="text-red-400 font-pixel text-xs animate-bounce bg-red-950/40 p-3 border border-red-800 rounded">
                    ⚠️ {bfError}
                  </div>
                )}
              </div>

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 Substring located at shift index 6! Friend added to RPG party!</div>
              )}
            </div>
          )}

          {type === 'bubble_sort' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">Bubble Sort Figma Icons</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">Click a bar to swap it with the adjacent bar to its right until ascending!</p>
              <div className="flex items-end justify-center gap-6 h-36 pt-4">
                {bars.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div
                      onClick={() => handleSortSwap(idx)}
                      className={`w-12 bg-[#3b82f6] border-2 border-[#60a5fa] rounded-t-sm hover:bg-[#60a5fa] cursor-pointer transition-all ${success ? 'bg-[#27ae60] border-[#4ade80]' : ''}`}
                      style={{ height: `${val}px` }}
                    />
                    <span className="font-pixel text-xs md:text-sm">{val}KB</span>
                  </div>
                ))}
              </div>
              {success && (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base animate-pulse">🎉 Assets bubble sorted perfectly!</div>
              )}
            </div>
          )}

          {type === 'selection_sort' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">Selection Sort Figma Icons</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? `Step ${selectionStep + 1}: Click the smallest asset bar in the unsorted region to select and swap it into position!` : "All assets successfully sorted!"}
              </p>
              <div className="flex items-end justify-center gap-6 h-36 pt-4">
                {bars.map((val, idx) => {
                  const isSorted = success || idx < selectionStep;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div
                        onClick={() => handleSelectionClick(idx)}
                        className={`w-12 border-2 rounded-t-sm transition-all ${isSorted ? 'bg-[#27ae60] border-[#4ade80] cursor-default' : 'bg-[#3b82f6] border-[#60a5fa] hover:bg-[#f7d354] cursor-pointer'}`}
                        style={{ height: `${val}px` }}
                      />
                      <span className="font-pixel text-xs md:text-sm">{val}KB</span>
                    </div>
                  )
                })}
              </div>
              {success && (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base animate-pulse">🎉 Assets selection sorted perfectly!</div>
              )}
            </div>
          )}

          {type === 'merge_sort' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Merge Sort Sub-Arrays'}</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? "Compare the smallest remaining elements of Left [12, 45] and Right [23, 67]. Click the smaller element to merge it into the final sorted array!" : "Sub-arrays merged perfectly at O(N log N)!"}
              </p>

              <div className="grid grid-cols-2 gap-6 bg-[#10121c] border border-[#3a495e] p-4 rounded max-w-lg mx-auto text-xs">
                <div className="p-3 bg-blue-950/40 border border-blue-700 rounded min-h-[90px] flex flex-col items-center justify-center shadow-lg">
                  <div className="text-blue-400 font-bold mb-2">⬅️ Left Sub-Array</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {mergeLeft.map((v, i) => (
                      <button key={i} onClick={() => handleMergeClick(v, 'left')} disabled={success} className="p-3 bg-[#2c2f44] border border-[#3a495e] hover:border-[#f7d354] rounded text-white font-pixel text-xs cursor-pointer shadow transition-all">
                        {v}KB
                      </button>
                    ))}
                    {mergeLeft.length === 0 && <span className="text-gray-500 italic">Empty</span>}
                  </div>
                </div>

                <div className="p-3 bg-green-950/40 border border-green-700 rounded min-h-[90px] flex flex-col items-center justify-center shadow-lg">
                  <div className="text-green-400 font-bold mb-2">Right Sub-Array ➡️</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {mergeRight.map((v, i) => (
                      <button key={i} onClick={() => handleMergeClick(v, 'right')} disabled={success} className="p-3 bg-[#2c2f44] border border-[#3a495e] hover:border-[#f7d354] rounded text-white font-pixel text-xs cursor-pointer shadow transition-all">
                        {v}KB
                      </button>
                    ))}
                    {mergeRight.length === 0 && <span className="text-gray-500 italic">Empty</span>}
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1c2c] border border-[#3a495e] p-4 rounded max-w-lg mx-auto">
                <div className="text-[#f7d354] text-xs font-bold mb-2 tracking-wider uppercase">✨ Merged Final Array:</div>
                <div className="flex flex-wrap gap-3 justify-center min-h-[44px] items-center">
                  {mergedArray.map((v, i) => (
                    <span key={i} className="p-3 bg-[#27ae60] border border-[#4ade80] rounded text-white font-pixel text-xs shadow animate-pop-in">
                      {v}KB
                    </span>
                  ))}
                  {mergedArray.length === 0 && <span className="text-gray-500 italic text-xs">Awaiting merged elements...</span>}
                </div>
              </div>

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 Sub-arrays merged perfectly in ascending order: [12, 23, 45, 67]!</div>
              )}
            </div>
          )}

          {type === 'quicksort' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Quicksort Asset Partitioning'}</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? (quickStep < 2 ? "Pivot is 45KB! First, select all elements SMALLER than 45 to move them to the Left Partition!" : "Now select all elements GREATER than 45 to move them to the Right Partition!") : "All assets successfully partitioned around pivot!"}
              </p>

              <div className="grid grid-cols-3 gap-4 bg-[#10121c] border border-[#3a495e] p-4 rounded max-w-lg mx-auto text-xs">
                <div className="p-3 bg-blue-950/40 border border-blue-700 rounded min-h-[80px] flex flex-col items-center justify-center">
                  <div className="text-blue-400 font-bold mb-2">⬅️ Left (&lt;45)</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickLeft.map((v, i) => <span key={i} className="p-2 bg-[#2c2f44] border border-blue-500 rounded text-white">{v}KB</span>)}
                  </div>
                </div>

                <div className="p-3 bg-yellow-950/40 border border-yellow-600 rounded min-h-[80px] flex flex-col items-center justify-center shadow-lg">
                  <div className="text-[#f7d354] font-bold mb-1">🎯 Pivot</div>
                  <div className="p-2 bg-[#1a1c2c] border-2 border-[#f7d354] rounded text-white font-bold text-sm">45KB</div>
                </div>

                <div className="p-3 bg-green-950/40 border border-green-700 rounded min-h-[80px] flex flex-col items-center justify-center">
                  <div className="text-green-400 font-bold mb-2">Right (&gt;45) ➡️</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickRight.map((v, i) => <span key={i} className="p-2 bg-[#2c2f44] border border-green-500 rounded text-white">{v}KB</span>)}
                  </div>
                </div>
              </div>

              {!success && (
                <div className="pt-4">
                  <p className="text-xs text-[#8b9bb4] mb-3 uppercase tracking-wider">Remaining Unpartitioned Assets:</p>
                  <div className="flex justify-center gap-4">
                    {quickRemaining.map((val, idx) => (
                      <button key={idx} onClick={() => handleQuickClick(val)} className="py-3 px-5 bg-[#2c2f44] border border-[#3a495e] hover:border-[#f7d354] text-white font-pixel text-xs cursor-pointer shadow">
                        {val}KB
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 Assets partitioned perfectly! [12, 23] &lt; 45 &lt; [67, 89]!</div>
              )}
            </div>
          )}

          {type === 'heapsort' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Heapsort Root Extraction'}</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? "Max-Heap built! Repeatedly extract the LARGEST remaining root element to place it at the end of the growing sorted array!" : "Max-Heap fully extracted and sorted!"}
              </p>

              <div className="grid grid-cols-2 gap-6 bg-[#10121c] border border-[#3a495e] p-6 rounded max-w-xl mx-auto text-xs">
                <div className="p-4 bg-yellow-950/40 border border-yellow-600 rounded min-h-[100px] flex flex-col items-center justify-center shadow-lg">
                  <div className="text-[#f7d354] font-bold mb-3">🔺 Max-Heap Elements</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {heapRemaining.map((v, i) => (
                      <button key={i} onClick={() => handleHeapClick(v)} disabled={success} className="p-3 bg-[#2c2f44] border border-[#3a495e] hover:border-[#f7d354] rounded text-white font-pixel text-xs cursor-pointer shadow transition-all">
                        {v}KB
                      </button>
                    ))}
                    {heapRemaining.length === 0 && <span className="text-gray-500 italic">Heap Empty</span>}
                  </div>
                </div>

                <div className="p-4 bg-green-950/40 border border-green-700 rounded min-h-[100px] flex flex-col items-center justify-center shadow-lg">
                  <div className="text-green-400 font-bold mb-3">✅ Sorted Array (End)</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {heapSorted.map((v, i) => (
                      <span key={i} className="p-3 bg-[#27ae60] border border-[#4ade80] rounded text-white font-pixel text-xs shadow animate-pop-in">
                        {v}KB
                      </span>
                    ))}
                    {heapSorted.length === 0 && <span className="text-gray-500 italic">No extracted roots yet</span>}
                  </div>
                </div>
              </div>

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 Assets heapsorted perfectly in ascending order: [12, 23, 45, 67, 89]!</div>
              )}
            </div>
          )}

          {type === 'mst' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Minimum Spanning Tree'} (Lab Wiring)</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? "Select the cheapest 3 network cables to link all 4 workstations (A, B, C, D) without creating cycles! Minimum total cost wins!" : "Lab workstations fully connected at absolute minimum cost!"}
              </p>

              <div className="bg-[#10121c] border border-[#3a495e] p-4 rounded max-w-lg mx-auto">
                <div className="text-yellow-400 text-xs font-bold mb-4 tracking-wider uppercase animate-pulse">
                  ⚡ Current Wiring Total: ${selectedEdges.reduce((sum, edgeId) => sum + (edges.find(e => e.id === edgeId)?.cost || 0), 0)} / $45 Optimal Cost
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  {edges.map((e) => {
                    const isSel = selectedEdges.includes(e.id);
                    return (
                      <div
                        key={e.id}
                        onClick={() => handleMstClick(e.id)}
                        className={`p-4 border rounded font-pixel text-xs flex flex-col justify-between transition-all cursor-pointer ${isSel ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white'}`}
                      >
                        <div className="flex justify-between items-center mb-2 font-bold">
                          <span>🔌 {e.nodes.join(' ── ')}</span>
                          <span className="text-[#f7d354]">${e.cost}</span>
                        </div>
                        <div className="text-[10px] text-center bg-black/40 py-1 rounded tracking-wider uppercase font-bold">
                          {isSel ? '✅ CONNECTED (Click to unplug)' : '🔌 CONNECT CABLE'}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {mstError && !success && (
                  <div className="mt-4 text-red-400 font-pixel text-xs animate-bounce bg-red-950/40 p-3 border border-red-800 rounded">
                    {mstError}
                  </div>
                )}
              </div>

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 Spanning tree complete! Workstations fully linked at optimal $45 cost!</div>
              )}
            </div>
          )}

          {type === 'dijkstra' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || "Dijkstra's Shortest Path"}</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? `Greedily pick the next unvisited vertex with the minimum cumulative travel time from Gate!` : "Shortest path to CS Building secured!"}
              </p>

              <div className="bg-[#10121c] border border-[#3a495e] p-4 rounded-sm max-w-md mx-auto">
                <div className="grid grid-cols-2 gap-6 text-center font-pixel text-xs">
                  <div className={`p-3 border rounded ${visitedNodes.includes('Gate') ? 'bg-[#27ae60] border-white text-white shadow-md' : 'bg-[#2c2f44] border-[#3a495e]'}`}>
                    <div>🏛️ Campus Gate</div>
                    <div className="text-[10px] text-yellow-300 mt-1">Dist: 0 min</div>
                  </div>

                  <div className={`p-3 border rounded transition-all ${visitedNodes.includes('Library') ? 'bg-[#27ae60] border-white text-white shadow-md' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] cursor-pointer'}`} onClick={() => handleDijkstraClick('Library')}>
                    <div>📚 Library</div>
                    <div className="text-[10px] text-yellow-300 mt-1">{visitedNodes.includes('Library') ? 'Dist: 5 min' : 'Weight: 5 min'}</div>
                  </div>

                  <div className={`p-3 border rounded transition-all ${visitedNodes.includes('Lounge') ? 'bg-[#27ae60] border-white text-white shadow-md' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] cursor-pointer'}`} onClick={() => handleDijkstraClick('Lounge')}>
                    <div>☕ Student Lounge</div>
                    <div className="text-[10px] text-yellow-300 mt-1">{visitedNodes.includes('Lounge') ? 'Dist: 10 min' : 'Weight: 10 min'}</div>
                  </div>

                  <div className={`p-3 border rounded transition-all ${visitedNodes.includes('CS Bldg') ? 'bg-[#27ae60] border-white text-white shadow-md' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] cursor-pointer'}`} onClick={() => handleDijkstraClick('CS Bldg')}>
                    <div>💻 CS Building (Goal)</div>
                    <div className="text-[10px] text-yellow-300 mt-1">{visitedNodes.includes('CS Bldg') ? 'Dist: 12 min' : 'Weight: 12 min'}</div>
                  </div>
                </div>
              </div>

              {success && (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base animate-pulse pt-2">🎉 Optimal path calculated: Gate → Lounge → CS Bldg (12 mins)!</div>
              )}
            </div>
          )}

          {type === 'dfs' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'DFS Graph Traversal'} (Skill Tree)</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? "Explore the skill tree DEEP along a branch first before backtracking! Order: Root → Fire Magic → Inferno (Leaf) → Backtrack → Ice Magic → Frostbite!" : "Ultimate Frostbite skill unlocked via DFS!"}
              </p>

              <div className="bg-[#10121c] border border-[#3a495e] p-6 rounded max-w-lg mx-auto text-xs space-y-6">
                <div className="flex justify-center">
                  <button onClick={() => handleDfsClick('Root')} className={`p-4 border rounded font-pixel text-xs font-bold transition-all ${dfsVisited.includes('Root') ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer'}`}>
                    🌳 Root (Start)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-2 border-t border-[#3a495e]/50">
                  <div className="space-y-4 flex flex-col items-center">
                    <button onClick={() => handleDfsClick('Fire Magic')} className={`p-3 w-full border rounded font-pixel text-xs transition-all ${dfsVisited.includes('Fire Magic') ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer'}`}>
                      🔥 Fire Magic (L)
                    </button>
                    <button onClick={() => handleDfsClick('Inferno')} className={`p-3 w-full border rounded font-pixel text-xs transition-all ${dfsVisited.includes('Inferno') ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer'}`}>
                      🌋 Inferno (L-L Leaf)
                    </button>
                  </div>

                  <div className="space-y-4 flex flex-col items-center">
                    <button onClick={() => handleDfsClick('Ice Magic')} className={`p-3 w-full border rounded font-pixel text-xs transition-all ${dfsVisited.includes('Ice Magic') ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer'}`}>
                      ❄️ Ice Magic (R)
                    </button>
                    <button onClick={() => handleDfsClick('Frostbite')} className={`p-3 w-full border rounded font-pixel text-xs transition-all ${dfsVisited.includes('Frostbite') ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer'}`}>
                      ✨ Frostbite (Goal)
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[#1a1c2c] border border-[#3a495e] rounded flex flex-wrap gap-2 items-center justify-center">
                  <span className="text-[#f7d354] font-bold">DFS Path:</span>
                  {dfsVisited.map((v, i) => <span key={i} className="text-white px-2 py-0.5 bg-[#2c2f44] border border-[#3a495e] rounded">{v}</span>)}
                </div>
              </div>

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 RPG ultimate skill unlocked instantly using Depth-First Traversal!</div>
              )}
            </div>
          )}

          {type === 'bfs' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'BFS Graph Traversal'} (Skill Tree)</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? "Explore the skill tree layer-by-layer across the current depth before moving deeper! Order: Root (L0) → Fire & Ice (L1) → Inferno & Frostbite (L2)!" : "Ultimate Frostbite skill unlocked via BFS!"}
              </p>

              <div className="bg-[#10121c] border border-[#3a495e] p-6 rounded max-w-lg mx-auto text-xs space-y-6">
                <div className="flex flex-col items-center border-b border-[#3a495e]/50 pb-4">
                  <div className="text-yellow-400 font-bold mb-2">Level 0:</div>
                  <button onClick={() => handleBfsClick('Root')} className={`p-4 border rounded font-pixel text-xs font-bold transition-all ${bfsVisited.includes('Root') ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer'}`}>
                    🌳 Root (Start)
                  </button>
                </div>

                <div className="flex flex-col items-center border-b border-[#3a495e]/50 pb-4">
                  <div className="text-blue-400 font-bold mb-2">Level 1 (Depth 1):</div>
                  <div className="flex gap-4 w-full justify-center">
                    <button onClick={() => handleBfsClick('Fire Magic')} className={`p-3 flex-1 border rounded font-pixel text-xs transition-all ${bfsVisited.includes('Fire Magic') ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer'}`}>
                      🔥 Fire Magic
                    </button>
                    <button onClick={() => handleBfsClick('Ice Magic')} className={`p-3 flex-1 border rounded font-pixel text-xs transition-all ${bfsVisited.includes('Ice Magic') ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer'}`}>
                      ❄️ Ice Magic
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-green-400 font-bold mb-2">Level 2 (Depth 2):</div>
                  <div className="flex gap-4 w-full justify-center">
                    <button onClick={() => handleBfsClick('Inferno')} className={`p-3 flex-1 border rounded font-pixel text-xs transition-all ${bfsVisited.includes('Inferno') ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer'}`}>
                      🌋 Inferno
                    </button>
                    <button onClick={() => handleBfsClick('Frostbite')} className={`p-3 flex-1 border rounded font-pixel text-xs transition-all ${bfsVisited.includes('Frostbite') ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white cursor-pointer'}`}>
                      ✨ Frostbite (Goal)
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[#1a1c2c] border border-[#3a495e] rounded flex flex-wrap gap-2 items-center justify-center">
                  <span className="text-[#f7d354] font-bold">BFS Layer Path:</span>
                  {bfsVisited.map((v, i) => <span key={i} className="text-white px-2 py-0.5 bg-[#2c2f44] border border-[#3a495e] rounded">{v}</span>)}
                </div>
              </div>

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 RPG ultimate skill unlocked layer-by-layer using Breadth-First Traversal!</div>
              )}
            </div>
          )}

          {type === 'huffman' && (
            <div className="w-full space-y-4 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Huffman Coding'} (5MB Compression)</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? `Step ${huffmanStep + 1}: Greedily merge the two sub-trees with the lowest character frequencies to build the prefix tree!` : "Documentation compressed successfully!"}
              </p>

              <div className="bg-[#10121c] border border-[#3a495e] p-4 rounded-sm max-w-md mx-auto space-y-3 font-pixel text-xs">
                <div className="flex justify-around items-center bg-[#1a1c2c] p-3 border border-[#3a495e] rounded">
                  <div className="p-2 bg-blue-900/40 border border-blue-600 rounded">A: 45%</div>
                  <div className="p-2 bg-blue-900/40 border border-blue-600 rounded">B: 30%</div>
                  <div className={`p-2 border rounded ${huffmanStep >= 1 ? 'bg-green-900/40 border-green-500' : 'bg-blue-900/40 border-blue-600'}`}>C: 20%</div>
                  <div className={`p-2 border rounded ${huffmanStep >= 1 ? 'bg-green-900/40 border-green-500' : 'bg-blue-900/40 border-blue-600'}`}>D: 5%</div>
                </div>

                {huffmanStep >= 1 && (
                  <div className="bg-green-950/40 p-2 border border-green-700 rounded animate-pop-in text-[#4ade80]">
                    🌿 Merged [C: 20%] + [D: 5%] → [CD Subtree: 25%]
                  </div>
                )}

                {huffmanStep >= 2 && (
                  <div className="bg-green-950/40 p-2 border border-green-700 rounded animate-pop-in text-[#4ade80]">
                    🌿 Merged [CD: 25%] + [B: 30%] → [BCD Subtree: 55%]
                  </div>
                )}

                {huffmanStep >= 3 && (
                  <div className="bg-green-950/40 p-2 border border-green-700 rounded animate-pop-in text-[#4ade80]">
                    🌿 Merged [BCD: 55%] + [A: 45%] → Root [100%] (Optimal Prefix Tree!)
                  </div>
                )}

                {!success && (
                  <button onClick={handleHuffmanClick} className="btn-pixel-menu py-3 px-6 text-xs w-full cursor-pointer mt-2">
                    MERGE LOWEST FREQUENCIES 🗜️
                  </button>
                )}
              </div>

              {success && (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base animate-pulse pt-2">🎉 Lossless prefix codes assigned! File size reduced below 5MB!</div>
              )}
            </div>
          )}

          {type === 'change_making' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Change Making Optimization'}</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? "Select the minimum number of coins to make exactly 37¢ for the bag of chips! Denominations: [25¢, 10¢, 5¢, 1¢]." : "Chips dispensed! 37¢ achieved with optimal 4 coins!"}
              </p>

              <div className="bg-[#10121c] border border-[#3a495e] p-6 rounded max-w-lg mx-auto text-xs space-y-6">
                <div className="flex justify-between items-center bg-[#1a1c2c] p-4 border border-[#3a495e] rounded">
                  <div className="text-left font-retro">
                    <span className="text-gray-400 block text-[10px]">TARGET PRICE:</span>
                    <span className="text-white font-pixel text-lg">37¢</span>
                  </div>
                  <div className="text-right font-retro">
                    <span className="text-gray-400 block text-[10px]">CURRENT DEPOSIT:</span>
                    <span className={`font-pixel text-lg ${changeTotal === 37 ? 'text-green-400' : 'text-yellow-400'}`}>{changeTotal}¢</span>
                  </div>
                  <div className="text-right font-retro">
                    <span className="text-gray-400 block text-[10px]">COIN COUNT:</span>
                    <span className="text-blue-400 font-pixel text-lg">{changeCoins.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <button onClick={() => handleChangeCoinClick(25)} disabled={success} className="p-4 bg-[#2c2f44] border border-[#3a495e] hover:border-[#f7d354] rounded text-white font-pixel text-xs cursor-pointer shadow hover:scale-105 transition-all">
                    🪙 25¢
                  </button>
                  <button onClick={() => handleChangeCoinClick(10)} disabled={success} className="p-4 bg-[#2c2f44] border border-[#3a495e] hover:border-[#f7d354] rounded text-white font-pixel text-xs cursor-pointer shadow hover:scale-105 transition-all">
                    🪙 10¢
                  </button>
                  <button onClick={() => handleChangeCoinClick(5)} disabled={success} className="p-4 bg-[#2c2f44] border border-[#3a495e] hover:border-[#f7d354] rounded text-white font-pixel text-xs cursor-pointer shadow hover:scale-105 transition-all">
                    🪙 5¢
                  </button>
                  <button onClick={() => handleChangeCoinClick(1)} disabled={success} className="p-4 bg-[#2c2f44] border border-[#3a495e] hover:border-[#f7d354] rounded text-white font-pixel text-xs cursor-pointer shadow hover:scale-105 transition-all">
                    🪙 1¢
                  </button>
                </div>

                <div className="p-3 bg-[#1a1c2c] border border-[#3a495e] rounded flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[#f7d354] font-bold">Inserted:</span>
                    {changeCoins.map((c, i) => <span key={i} className="text-white px-2 py-1 bg-[#2c2f44] border border-[#3a495e] rounded">{c}¢</span>)}
                    {changeCoins.length === 0 && <span className="text-gray-500 italic">No coins inserted</span>}
                  </div>
                  {!success && (
                    <button onClick={handleChangeReset} className="px-3 py-1 bg-red-950/80 border border-red-700 text-red-300 hover:text-white rounded font-pixel text-[10px] cursor-pointer">
                      RESET 🔄
                    </button>
                  )}
                </div>

                {changeError && !success && (
                  <div className="text-red-400 font-pixel text-xs animate-bounce bg-red-950/40 p-3 border border-red-800 rounded">
                    {changeError}
                  </div>
                )}
              </div>

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 Chips dispensed! Optimal 4 coins used via Dynamic Programming!</div>
              )}
            </div>
          )}

          {type === 'coin_row' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Coin Row Dynamic Programming'}</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? "Select coins from the bench to maximize total bounty! Security rule: You CANNOT pick two adjacent coins! Click Check Bounty when ready." : "Optimal non-adjacent bounty collected!"}
              </p>

              <div className="bg-[#10121c] border border-[#3a495e] p-6 rounded max-w-lg mx-auto text-xs space-y-6">
                <div className="text-yellow-400 font-bold tracking-wider animate-pulse uppercase">
                  💰 Current Selected Total: {coinRowSelected.reduce((acc, i) => acc + coinRowValues[i], 0)}¢
                </div>

                <div className="flex justify-center gap-4">
                  {coinRowValues.map((val, idx) => {
                    const isSel = coinRowSelected.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleCoinRowClick(idx)}
                        className={`p-4 border rounded font-pixel text-xs flex flex-col items-center justify-between cursor-pointer transition-all shadow hover:scale-105 ${isSel ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white'}`}
                      >
                        <span className="text-lg mb-1">🪙</span>
                        <span className="font-bold text-white">{val}¢</span>
                        <span className="text-[8px] bg-black/40 px-1.5 py-0.5 rounded mt-2 uppercase">{isSel ? 'SELECTED' : 'PICK'}</span>
                      </div>
                    )
                  })}
                </div>

                {!success && (
                  <button onClick={handleCoinRowCheck} className="btn-pixel-menu py-3 px-6 text-xs w-full cursor-pointer">
                    CHECK MAX BOUNTY 💰
                  </button>
                )}

                {coinRowError && !success && (
                  <div className="text-red-400 font-pixel text-xs animate-bounce bg-red-950/40 p-3 border border-red-800 rounded">
                    {coinRowError}
                  </div>
                )}
              </div>

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 Ultimate bounty achieved! 26¢ collected without setting off security lasers!</div>
              )}
            </div>
          )}

          {type === 'dp' && (
            <div className="w-full space-y-3 text-center">
              <p className="font-pixel text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Coin Collecting DP'}</p>
              <p className="text-xs md:text-sm text-[#8b9bb4] leading-relaxed">Move Right [▶] or Down [▼] to reach the bottom-right corner while collecting optimal loot!</p>
              <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto pt-2">
                {gridCoins.map((row, r) =>
                  row.map((val, c) => {
                    const isCurrent = pos.r === r && pos.c === c;
                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`h-16 border flex flex-col items-center justify-center font-pixel text-sm rounded-sm ${isCurrent ? 'bg-[#f7d354] text-black border-white animate-pulse shadow-md' : 'bg-[#1a1c2c] border-[#3a495e] text-white'}`}
                      >
                        {isCurrent ? '📍' : val > 0 ? `🪙${val}` : '—'}
                      </div>
                    )
                  })
                )}
              </div>
              <div className="flex justify-center gap-4 pt-4">
                <button
                  disabled={pos.c >= 2 || success}
                  onClick={() => handleDpMove(0, 1)}
                  className="btn-pixel-menu py-3 px-6 text-sm cursor-pointer disabled:opacity-30"
                >
                  MOVE RIGHT ▶
                </button>
                <button
                  disabled={pos.r >= 2 || success}
                  onClick={() => handleDpMove(1, 0)}
                  className="btn-pixel-menu py-3 px-6 text-sm cursor-pointer disabled:opacity-30"
                >
                  MOVE DOWN ▼
                </button>
              </div>
              {success && (
                <div className="text-[#4ade80] font-pixel text-sm md:text-base pt-2 animate-pulse">🎉 Reached Goal! Total Bounties: 🪙{coinsCollected}!</div>
              )}
            </div>
          )}

          {type === 'backtracking' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Backtracking Logic Circuit'}</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? "Configure switches to reach [ON, ON, ON]. If SW1 and SW2 are ON without SW3, a short circuit occurs and you MUST backtrack!" : "Circuit configured perfectly! Degree secured!"}
              </p>

              <div className="bg-[#10121c] border border-[#3a495e] p-6 rounded max-w-lg mx-auto text-xs space-y-6">
                <div className="flex justify-center gap-6">
                  {switches.map((st, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSwitchToggle(idx)}
                      disabled={success}
                      className={`w-24 h-24 border-2 font-pixel text-xs flex flex-col items-center justify-center transition-all cursor-pointer rounded shadow hover:scale-105 ${st ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] text-[#8b9bb4] hover:text-white hover:border-[#f7d354]'}`}
                    >
                      <span className="text-lg mb-1">🔌</span>
                      <span className="font-bold">SW {idx + 1}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded mt-1 font-bold ${st ? 'bg-black/40 text-[#f7d354]' : 'bg-black/20 text-gray-500'}`}>{st ? 'ON' : 'OFF'}</span>
                    </button>
                  ))}
                </div>

                {violation && (
                  <div className="text-red-400 font-pixel text-xs animate-bounce bg-red-950/40 p-4 border border-red-800 rounded">
                    ⚠️ SHORT CIRCUIT DETECTED! Incompatible partial state [SW1: ON, SW2: ON]. You MUST backtrack (click SW2 to turn OFF) before proceeding!
                  </div>
                )}

                <div className="p-3 bg-[#1a1c2c] border border-[#3a495e] rounded text-left space-y-1">
                  <div className="text-[#f7d354] font-bold text-[10px] uppercase">State-Space Search History:</div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {backtrackHistory.map((h, i) => <span key={i} className="text-[10px] text-gray-300 bg-[#2c2f44] px-1.5 py-0.5 border border-[#3a495e] rounded">{h}</span>)}
                    {backtrackHistory.length === 0 && <span className="text-gray-500 italic">No state changes yet</span>}
                  </div>
                </div>
              </div>

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 Circuit configured perfectly! Degree secured via Backtracking search!</div>
              )}
            </div>
          )}

          {type === 'branch_bound' && (
            <div className="w-full space-y-4 text-center font-pixel">
              <p className="text-sm md:text-base text-[#ecf0f1]">{choice.unlocksAlgorithm || 'Branch and Bound Tech Packing'}</p>
              <p className="font-retro text-xs md:text-sm text-[#8b9bb4] leading-relaxed">
                {!success ? "Pack Cassie's tech pouch optimally! Pouch weight limit: 15 oz. Prune branches exceeding limit to maximize total value!" : "Optimal pruned tech pouch packed!"}
              </p>

              <div className="bg-[#10121c] border border-[#3a495e] p-6 rounded max-w-lg mx-auto text-xs space-y-6">
                <div className="flex justify-between items-center bg-[#1a1c2c] p-4 border border-[#3a495e] rounded">
                  <div className="text-left font-retro">
                    <span className="text-gray-400 block text-[10px]">POUCH WEIGHT:</span>
                    <span className={`font-pixel text-lg ${bbSelected.reduce((sum, i) => sum + bbItems.find(item => item.id === i).weight, 0) > 15 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                      {bbSelected.reduce((sum, i) => sum + bbItems.find(item => item.id === i).weight, 0)} / 15 oz
                    </span>
                  </div>
                  <div className="text-right font-retro">
                    <span className="text-gray-400 block text-[10px]">TOTAL VALUE:</span>
                    <span className="text-green-400 font-pixel text-lg">
                      ${bbSelected.reduce((sum, i) => sum + bbItems.find(item => item.id === i).value, 0)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {bbItems.map((item) => {
                    const isSel = bbSelected.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleBbClick(item.id)}
                        className={`p-4 border rounded font-pixel text-xs flex flex-col justify-between cursor-pointer transition-all shadow hover:scale-105 ${isSel ? 'bg-[#27ae60] border-white text-white shadow-[0_0_15px_#27ae60]' : 'bg-[#2c2f44] border-[#3a495e] hover:border-[#f7d354] text-[#8b9bb4] hover:text-white'}`}
                      >
                        <div className="flex justify-between font-bold text-white mb-2">
                          <span>🎒 {item.name}</span>
                          <span className="text-[#f7d354]">${item.value}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-gray-400">{item.weight} oz</span>
                          <span className="bg-black/40 px-2 py-0.5 rounded uppercase font-bold">{isSel ? 'PACKED' : 'ADD'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {!success && (
                  <button onClick={handleBbCheck} className="btn-pixel-menu py-3 px-6 text-xs w-full cursor-pointer">
                    VERIFY OPTIMAL LOAD 🎒
                  </button>
                )}

                {bbError && !success && (
                  <div className="text-red-400 font-pixel text-xs animate-bounce bg-red-950/40 p-3 border border-red-800 rounded">
                    {bbError}
                  </div>
                )}
              </div>

              {success && (
                <div className="text-[#4ade80] text-sm md:text-base animate-pulse pt-2">🎉 Tech pouch packed optimally! Maximum $105 value achieved under 15 oz limit!</div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-4">
          <button
            disabled={!success}
            onClick={() => { audio.playAdvance(); onComplete(); }}
            className={`w-full py-4 font-pixel text-sm md:text-base uppercase text-center transition-all ${success ? 'btn-pixel-menu cursor-pointer animate-pulse' : 'bg-black/50 border-2 border-[#3a495e] text-[#8b9bb4] opacity-50 cursor-not-allowed'}`}
          >
            {success ? 'ALGORITHM OPTIMIZED - CONTINUE ▶' : 'SOLVE MINIGAME TO PROCEED'}
          </button>
          <button
            onClick={() => { audio.playSelect(); onClose(); }}
            className="px-6 border-2 border-[#3a495e] hover:border-white text-[#8b9bb4] hover:text-white font-pixel text-sm uppercase cursor-pointer"
          >
            SKIP
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Main Game Screen
   ═══════════════════════════════════════════ */
const OUT_OF_STAMINA_NODE = {
  text: "🚨 STAMINA DEPLETED! 🚨\n\nYou selected too many inefficient algorithms with high time complexity! Your computational resources and mental stamina are completely drained.\n\nTake a deep breath, restart the chapter, and choose more optimal algorithms to complete your coursework!",
  speaker: "System Monitor",
  choices: [
    {
      label: "RESTART CHAPTER",
      nextNode: "start",
      unlocksAlgorithm: null,
      restartChapter: true,
      icon: "🔄"
    },
    {
      label: "RETURN TO CHAPTER SELECT",
      nextNode: "start",
      unlocksAlgorithm: null,
      returnToMenu: true,
      icon: "◀️"
    }
  ]
}

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
  const [stamina, setStamina] = useState(100)
  const [activeMinigame, setActiveMinigame] = useState(null)
  const [unlockedAlgorithms, setUnlockedAlgorithms] = useState([])
  const [hoveredChoice, setHoveredChoice] = useState(null)

  const [achievementPopup, setAchievementPopup] = useState(null)

  // Typewriter State

  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [textIndex, setTextIndex] = useState(0)

  const chapter = gameData.chapters.find((c) => c.id === currentChapter)
  const node = currentNode === 'out_of_stamina' ? OUT_OF_STAMINA_NODE : chapter?.nodes?.[currentNode]

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

    // Check if minigame should trigger
    let mgType = null
    const algo = choice.unlocksAlgorithm || ''
    const lbl = choice.label?.toLowerCase() || ''

    if (algo === "Euclid's Algorithm" || lbl.includes("euclid")) mgType = 'gcd'
    else if (algo === "Consecutive Integer Check" || lbl.includes("consecutive")) mgType = 'consecutive_check'
    else if (algo === "Middle School Procedure" || lbl.includes("middle school")) mgType = 'middle_school'
    else if (algo === "Factorial (Recursion)" || lbl.includes("factorial")) mgType = 'factorial'
    else if (algo === "Unique Elements" || lbl.includes("unique")) mgType = 'unique_elements'
    else if (algo === "Max Element" || lbl.includes("max element")) mgType = 'max_element'
    else if (lbl.includes("page by page")) mgType = 'sequential_search_karaoke'
    else if (algo === "Sequential Search" || lbl.includes("sequential search")) mgType = 'sequential_search'
    else if (algo === "Binary Search" || lbl.includes("binary search")) mgType = 'binary_search'
    else if (algo === "Interpolation Search" || lbl.includes("interpolation")) mgType = 'interpolation_search'
    else if (algo === "Insertion Search" || lbl.includes("insertion")) mgType = 'insertion_search'
    else if (algo === "BF String Matching" || lbl.includes("bf string") || lbl.includes("matching")) mgType = 'bf_string_matching'
    else if (algo === "Selection Sort" || lbl.includes("selection sort")) mgType = 'selection_sort'
    else if (algo === "Bubble Sort" || lbl.includes("bubble sort")) mgType = 'bubble_sort'
    else if (algo === "Merge Sort" || lbl.includes("merge sort")) mgType = 'merge_sort'
    else if (algo === "Quicksort" || lbl.includes("quicksort")) mgType = 'quicksort'
    else if (algo === "Heapsort" || lbl.includes("heapsort")) mgType = 'heapsort'
    else if (algo === "Prim's Algorithm" || algo === "Kruskal's Algorithm" || lbl.includes("prim's") || lbl.includes("kruskal's")) mgType = 'mst'
    else if (algo === "Dijkstra's Algorithm" || lbl.includes("dijkstra")) mgType = 'dijkstra'
    else if (algo === "DFS" || lbl.includes("dfs")) mgType = 'dfs'
    else if (algo === "BFS" || lbl.includes("bfs")) mgType = 'bfs'
    else if (algo === "Huffman Coding" || lbl.includes("huffman")) mgType = 'huffman'
    else if (algo === "Change Making" || lbl.includes("change making")) mgType = 'change_making'
    else if (algo === "Coin Row" || lbl.includes("coin row")) mgType = 'coin_row'
    else if (algo.includes("Coin") || lbl.includes("coin")) mgType = 'dp'
    else if (algo === "Backtracking" || lbl.includes("backtracking")) mgType = 'backtracking'
    else if (algo === "Branch and Bound" || lbl.includes("branch and bound")) mgType = 'branch_bound'

    if (mgType) {
      setActiveMinigame({ type: mgType, choice })
      return
    }

    processChoice(choice)
  }

  function processChoice(choice) {
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
      setStamina(100)
      setScreen('chapter_select')
      return
    }
    if (choice.restartChapter) {
      audio.playAdvance()
      setStamina(100)
      setCurrentNode('start')
      return
    }
    if (choice.resetProgress) {
      audio.playAdvance()
      setUnlockedAlgorithms([])
      setCurrentChapter(1)
      setCurrentNode('start')
      setStamina(100)
      setScreen('title')
      return
    }
    if (choice.advanceChapter) {
      audio.playAdvance()
      const nextIdx = gameData.chapters.findIndex((c) => c.id === currentChapter) + 1
      if (nextIdx < gameData.chapters.length) {
        setStamina(100)
        setCurrentChapter(gameData.chapters[nextIdx].id)
        setCurrentNode(choice.nextNode)
        return
      }
    }

    // Deduct stamina for inefficient / suboptimal algorithm choices
    if (
      choice.nextNode?.includes('suboptimal') ||
      choice.label?.toLowerCase().includes('consecutive') ||
      choice.label?.toLowerCase().includes('middle school') ||
      choice.label?.toLowerCase().includes('nested loop') ||
      choice.label?.toLowerCase().includes('sort entire array') ||
      choice.label?.toLowerCase().includes('page by page') ||
      choice.label?.toLowerCase().includes('random') ||
      choice.label?.toLowerCase().includes('selection sort') ||
      choice.label?.toLowerCase().includes('bubble sort') ||
      choice.label?.toLowerCase().includes('blind') ||
      choice.label?.toLowerCase().includes('greedi') ||
      choice.label?.toLowerCase().includes('manuall') ||
      choice.label?.toLowerCase().includes('inspect') ||
      choice.label?.toLowerCase().includes('mesh') ||
      choice.label?.toLowerCase().includes('exhaust')
    ) {
      const nextStam = stamina - 40
      setStamina(Math.max(0, nextStam))
      if (nextStam <= 0) {
        audio.playGameOver()
        setCurrentNode('out_of_stamina')
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
            setStamina(100)
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
        <Atmosphere showCollage={false} crtEffect={settings.crtEffect} chapterId={chapter.id} nodeId={currentNode} />

        {/* LEFT COLUMN: Narrative & Choices */}
        <div className="w-1/2 flex flex-col dialogue-panel z-10 relative">
          <header className="px-8 pt-8 pb-4 flex justify-between items-start">
            <div>
              <h2 className="font-pixel text-retro-accent text-sm md:text-base glow-accent tracking-tighter uppercase">
                CHAPTER {chapter.id}: {chapter.title}
              </h2>
              {/* Stamina Meter */}
              <div className="flex items-center gap-3 mt-3 font-pixel text-xs md:text-sm bg-black/40 px-3 py-2 border border-[#3a495e] rounded-sm w-fit shadow-md">
                <span className={`font-bold flex items-center gap-1 ${stamina > 30 ? 'text-[#4ade80]' : 'text-red-500 animate-pulse'}`}>
                  ⚡ STAMINA: {stamina}%
                </span>
                <div className="w-40 bg-[#1a1c2c] border-2 border-[#3a495e] h-4 rounded-sm overflow-hidden flex shadow-inner">
                  <div
                    className={`h-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.3)] ${stamina > 50 ? 'bg-[#4ade80]' : stamina > 25 ? 'bg-[#f7d354]' : 'bg-red-500 animate-pulse'}`}
                    style={{ width: `${stamina}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-start">
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
          <div className="relative w-full h-full flex items-end justify-end translate-y-48">
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
                    right: `${(Object.keys(CHARACTER_SPRITES).length - 1 - idx) * 225 - 120}px`,
                    zIndex: isActive ? 40 : 30 - idx,
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

      {activeMinigame && (
        <AlgorithmMinigameModal
          minigameData={activeMinigame}
          onComplete={() => {
            const ch = activeMinigame.choice
            setActiveMinigame(null)
            processChoice(ch)
          }}
          onClose={() => {
            const ch = activeMinigame.choice
            setActiveMinigame(null)
            processChoice(ch)
          }}
        />
      )}
    </>
  )
}
