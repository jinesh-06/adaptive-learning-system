import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  RotateCcw,
  Plus,
  Trash2,
  Database,
  ArrowLeftRight,
  Zap,
  CheckCircle2,
  Cpu,
  Activity,
  Sliders,
  Sparkles
} from 'lucide-react';

// =================================================================
// 1. LRU CACHE VISUALIZER (Dual-Structure: Hash Map + Doubly Linked List)
// =================================================================
export const LRUCacheVisualizer: React.FC = () => {
  interface NodeItem {
    key: string;
    val: number;
  }

  const [capacity] = useState(3);
  // nodes in order: index 0 is LRU (head.next), last is MRU (tail.prev)
  const [nodes, setNodes] = useState<NodeItem[]>([
    { key: 'A', val: 10 },
    { key: 'B', val: 20 },
    { key: 'C', val: 30 }
  ]);
  const [log, setLog] = useState<string>('LRU Cache initialized with capacity 3. Accesses promote keys to MRU.');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleGet = (key: string) => {
    setActiveAction(`GET(${key})`);
    const idx = nodes.findIndex(n => n.key === key);
    if (idx === -1) {
      setLog(`[CACHE MISS] Key "${key}" not found in cache. Return -1.`);
      return;
    }
    const accessed = nodes[idx];
    const remaining = nodes.filter((_, i) => i !== idx);
    const updated = [...remaining, accessed];
    setNodes(updated);
    setLog(`[CACHE HIT] Key "${key}" found with value ${accessed.val}. Promoted to MRU tail!`);
  };

  const handlePut = (key: string, val: number) => {
    setActiveAction(`PUT(${key}, ${val})`);
    const existingIdx = nodes.findIndex(n => n.key === key);
    if (existingIdx !== -1) {
      const remaining = nodes.filter((_, i) => i !== existingIdx);
      setNodes([...remaining, { key, val }]);
      setLog(`[UPDATE] Updated existing Key "${key}" to ${val} and promoted to MRU tail.`);
      return;
    }

    if (nodes.length >= capacity) {
      const evicted = nodes[0];
      const remaining = nodes.slice(1);
      setNodes([...remaining, { key, val }]);
      setLog(`[EVICTION] Capacity reached (${capacity})! Evicted LRU Key "${evicted.key}". Inserted "${key}" as MRU tail.`);
    } else {
      setNodes([...nodes, { key, val }]);
      setLog(`[INSERT] Added Key "${key}" with value ${val} directly at MRU tail.`);
    }
  };

  const handleReset = () => {
    setNodes([
      { key: 'A', val: 10 },
      { key: 'B', val: 20 },
      { key: 'C', val: 30 }
    ]);
    setActiveAction(null);
    setLog('Cache reset to initial state: A (LRU), B, C (MRU).');
  };

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-slate-900/60 light-theme:bg-white p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Database className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white light-theme:text-slate-900">
              Interactive LRU Cache Visualizer (Dual-Structure O(1))
            </h3>
            <p className="text-xs text-slate-400 light-theme:text-slate-600">
              Watch Hash Map lookups synchronize with Doubly Linked List node splicing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-purple-300">
            Capacity: {nodes.length} / {capacity}
          </span>
          <button
            onClick={handleReset}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Interactive Command Triggers */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-mono">Test Operations:</span>
        <button
          onClick={() => handleGet('A')}
          className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-mono font-bold"
        >
          get("A")
        </button>
        <button
          onClick={() => handleGet('B')}
          className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-mono font-bold"
        >
          get("B")
        </button>
        <button
          onClick={() => handleGet('Z')}
          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono font-bold"
        >
          get("Z") [Miss]
        </button>
        <button
          onClick={() => handlePut('D', 40)}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono font-bold"
        >
          put("D", 40) [Evicts LRU]
        </button>
        <button
          onClick={() => handlePut('E', 50)}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono font-bold"
        >
          put("E", 50)
        </button>
      </div>

      {/* Side-by-side Dual Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Hash Map */}
        <div className="p-4 rounded-xl bg-slate-950 light-theme:bg-slate-50 border border-slate-800 light-theme:border-slate-300 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400 light-theme:text-blue-600 border-b border-slate-800 pb-2">
            <span>HASH MAP (O(1) Direct Pointer Index)</span>
            <span>key -&gt; Node*</span>
          </div>
          <div className="space-y-2">
            {nodes.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-2">Hash Map is empty.</div>
            ) : (
              nodes.map(n => (
                <div
                  key={n.key}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 light-theme:bg-white border border-slate-800 text-xs font-mono"
                >
                  <span className="text-purple-300 font-bold">"{n.key}"</span>
                  <span className="text-slate-500">──&gt;</span>
                  <span className="text-emerald-400">Node({n.key}, val={n.val})</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Doubly Linked List */}
        <div className="p-4 rounded-xl bg-slate-950 light-theme:bg-slate-50 border border-slate-800 light-theme:border-slate-300 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-400 light-theme:text-purple-600 border-b border-slate-800 pb-2">
            <span>DOUBLY LINKED LIST (Temporal Ordering)</span>
            <span>Head (LRU) &lt;--&gt; Tail (MRU)</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-2">
            {/* Sentinel Head */}
            <div className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-center shrink-0">
              <span className="text-[10px] text-slate-500 font-mono block">SENTINEL</span>
              <span className="text-xs font-bold text-slate-400 font-mono">HEAD</span>
            </div>
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            {/* Real Data Nodes */}
            {nodes.map((n, idx) => {
              const isLRU = idx === 0;
              const isMRU = idx === nodes.length - 1;
              return (
                <React.Fragment key={n.key}>
                  <div
                    className={`p-2.5 rounded-xl border text-center shrink-0 min-w-[70px] transition-all ${
                      isMRU
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/20'
                        : isLRU
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                        : 'border-slate-700 bg-slate-900 text-slate-200'
                    }`}
                  >
                    <span className="text-[9px] font-mono block uppercase font-bold text-slate-400">
                      {isLRU ? '🔥 LRU (Next)' : isMRU ? '⚡ MRU (Recent)' : `Node #${idx + 1}`}
                    </span>
                    <span className="text-sm font-black font-mono my-0.5 block">{n.key}: {n.val}</span>
                  </div>
                  {idx < nodes.length - 1 && (
                    <ArrowLeftRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}

            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            {/* Sentinel Tail */}
            <div className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-center shrink-0">
              <span className="text-[10px] text-slate-500 font-mono block">SENTINEL</span>
              <span className="text-xs font-bold text-slate-400 font-mono">TAIL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Output Log */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
        <span className="text-slate-300">{log}</span>
      </div>
    </div>
  );
};

// =================================================================
// 2. COMPREHENSION VISUALIZER (Loop vs Declarative Transformation)
// =================================================================
export const ComprehensionVisualizer: React.FC = () => {
  const [step, setStep] = useState(0);
  const items = [1, 2, 3, 4, 5, 6];

  const handleNext = () => {
    setStep(prev => (prev < items.length ? prev + 1 : 0));
  };

  const processed = items.slice(0, step);
  const evens = processed.filter(x => x % 2 === 0);
  const squares = evens.map(x => x ** 2);

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/60 light-theme:bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white light-theme:text-slate-900">
              Comprehension Transformation Engine
            </h3>
            <p className="text-xs text-slate-400 light-theme:text-slate-600">
              Watch sequential elements filter and transform declarative bytecode
            </p>
          </div>
        </div>
        <button
          onClick={handleNext}
          className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
        >
          {step < items.length ? `Process Item #${step + 1}` : 'Restart Stream'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-slate-400 block font-bold">1. ITERABLE STREAM:</span>
          <div className="flex gap-1.5">
            {items.map((num, i) => (
              <span
                key={i}
                className={`px-2 py-1 rounded border text-center ${
                  i < step
                    ? 'border-slate-700 bg-slate-800 text-slate-400'
                    : i === step
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold animate-pulse'
                    : 'border-slate-800 text-slate-600'
                }`}
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-amber-400 block font-bold">2. PREDICATE (x % 2 == 0):</span>
          <div className="flex gap-1.5">
            {evens.length === 0 ? (
              <span className="text-slate-500 italic">Awaiting even matches...</span>
            ) : (
              evens.map((num, i) => (
                <span key={i} className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                  {num}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-emerald-400 block font-bold">3. OUTPUT LIST [x**2]:</span>
          <div className="flex gap-1.5">
            {squares.length === 0 ? (
              <span className="text-slate-500 italic">Empty output list []</span>
            ) : (
              squares.map((num, i) => (
                <span key={i} className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                  {num}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
        <span>Equivalent: <strong className="text-cyan-400">[x**2 for x in nums if x % 2 == 0]</strong></span>
        <span className="text-emerald-400 font-bold">Result: {JSON.stringify(squares)}</span>
      </div>
    </div>
  );
};

// =================================================================
// 3. FUNCTIONAL PIPELINE VISUALIZER (Filter -> Map -> Reduce)
// =================================================================
export const FunctionalPipelineVisualizer: React.FC = () => {
  const [stage, setStage] = useState<number>(0);
  const rawData = [1, 2, 3, 4, 5, 6];

  const filtered = rawData.filter(x => x % 2 === 0);
  const mapped = filtered.map(x => x ** 3);
  const reduced = mapped.reduce((acc, x) => acc + x, 0);

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/60 light-theme:bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Zap className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white light-theme:text-slate-900">
              Functional Pipeline: filter() -&gt; map() -&gt; reduce()
            </h3>
            <p className="text-xs text-slate-400 light-theme:text-slate-600">
              Lazy stream evaluation through higher-order functional operations
            </p>
          </div>
        </div>
        <button
          onClick={() => setStage(prev => (prev < 3 ? prev + 1 : 0))}
          className="px-4 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition-all"
        >
          {stage === 0 ? 'Run filter(is_even)' : stage === 1 ? 'Run map(cube)' : stage === 2 ? 'Run reduce(sum)' : 'Reset Pipeline'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className={`p-3.5 rounded-xl border ${stage >= 0 ? 'border-slate-700 bg-slate-950' : 'opacity-40'}`}>
          <span className="text-slate-400 font-bold block mb-1">Raw Iterable:</span>
          <div className="text-cyan-300 font-bold">[1, 2, 3, 4, 5, 6]</div>
        </div>

        <div className={`p-3.5 rounded-xl border ${stage >= 1 ? 'border-blue-500/40 bg-blue-950/20' : 'border-slate-800 opacity-40'}`}>
          <span className="text-blue-400 font-bold block mb-1">1. filter(even):</span>
          <div className="text-blue-200 font-bold">{stage >= 1 ? JSON.stringify(filtered) : '---'}</div>
        </div>

        <div className={`p-3.5 rounded-xl border ${stage >= 2 ? 'border-purple-500/40 bg-purple-950/20' : 'border-slate-800 opacity-40'}`}>
          <span className="text-purple-400 font-bold block mb-1">2. map(cube):</span>
          <div className="text-purple-200 font-bold">{stage >= 2 ? JSON.stringify(mapped) : '---'}</div>
        </div>

        <div className={`p-3.5 rounded-xl border ${stage >= 3 ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-slate-800 opacity-40'}`}>
          <span className="text-emerald-400 font-bold block mb-1">3. reduce(add):</span>
          <div className="text-emerald-300 font-black text-sm">{stage >= 3 ? reduced : '---'}</div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// 4. DYNAMIC ARRAY RESIZING VISUALIZER
// =================================================================
export const DynamicArrayVisualizer: React.FC = () => {
  const [elements, setElements] = useState<number[]>([10, 20]);
  const [capacity, setCapacity] = useState<number>(2);
  const [message, setMessage] = useState('Initial state: Size = 2, Capacity = 2 (Full).');

  const handleAppend = () => {
    const nextVal = (elements.length + 1) * 10;
    if (elements.length === capacity) {
      const newCap = capacity * 2;
      setCapacity(newCap);
      setElements([...elements, nextVal]);
      setMessage(`[CAPACITY DOUBLED] Size reached capacity (${capacity}). Reallocated array to capacity ${newCap}. Appended ${nextVal}. Amortized O(1).`);
    } else {
      setElements([...elements, nextVal]);
      setMessage(`[O(1) APPEND] Placed ${nextVal} into pre-allocated memory slot. Size = ${elements.length + 1}, Capacity = ${capacity}.`);
    }
  };

  const handleReset = () => {
    setElements([10, 20]);
    setCapacity(2);
    setMessage('Array reset to Size = 2, Capacity = 2.');
  };

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-slate-900/60 light-theme:bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Layers className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white light-theme:text-slate-900">
              Dynamic Array Geometric Expansion
            </h3>
            <p className="text-xs text-slate-400 light-theme:text-slate-600">
              Witness capacity doubling and amortized O(1) memory guarantees
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAppend}
            disabled={elements.length >= 16}
            className="px-3.5 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs disabled:opacity-40"
          >
            Append Element
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Visual Memory Blocks */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Contiguous Buffer: Size = {elements.length}, Capacity = {capacity}</span>
          <span className="text-cyan-400">Amortized Cost: O(1)</span>
        </div>
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: capacity }).map((_, i) => {
            const hasVal = i < elements.length;
            return (
              <div
                key={i}
                className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-all ${
                  hasVal
                    ? 'border-blue-400 bg-blue-500/20 text-blue-200 font-bold'
                    : 'border-dashed border-slate-800 bg-slate-900/40 text-slate-600'
                }`}
              >
                <div className="text-[9px] text-slate-500">[{i}]</div>
                <div className="text-sm font-black my-0.5">{hasVal ? elements[i] : 'None'}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
        {message}
      </div>
    </div>
  );
};

// =================================================================
// 5. HASH TABLE BUCKET & COLLISION VISUALIZER
// =================================================================
export const HashTableVisualizer: React.FC = () => {
  const [buckets, setBuckets] = useState<Record<number, Array<{ key: string; val: number }>>>({
    1: [{ key: 'apple', val: 5 }],
    4: [{ key: 'banana', val: 12 }],
    6: [{ key: 'cherry', val: 8 }]
  });
  const [log, setLog] = useState('Hash table with 8 buckets. Keys hash to bucket index = hash(key) % 8.');

  const handleInsert = (key: string, val: number) => {
    // Simple mock hash formula: sum of char codes % 8
    const hash = key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 8;
    const cur = buckets[hash] || [];
    const collision = cur.length > 0 && !cur.some(item => item.key === key);
    
    setBuckets(prev => ({
      ...prev,
      [hash]: [...(prev[hash] || []).filter(item => item.key !== key), { key, val }]
    }));

    if (collision) {
      setLog(`[COLLISION RESOLVED] Key "${key}" hashed to Bucket #${hash} (already occupied!). Chained into bucket list.`);
    } else {
      setLog(`Key "${key}" hashed to Bucket #${hash}. Inserted in O(1) time.`);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/60 light-theme:bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Database className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white light-theme:text-slate-900">
              Hash Table Buckets & Collision Chaining
            </h3>
            <p className="text-xs text-slate-400 light-theme:text-slate-600">
              Visualize hash index distribution and separate chaining on bucket collision
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleInsert('grape', 15)}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold"
          >
            + "grape"
          </button>
          <button
            onClick={() => handleInsert('orange', 22)}
            className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold"
          >
            + "orange"
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
        {Array.from({ length: 8 }).map((_, bIdx) => {
          const chain = buckets[bIdx] || [];
          return (
            <div key={bIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Bucket #{bIdx}</span>
              {chain.length === 0 ? (
                <span className="text-slate-700 italic block">[empty]</span>
              ) : (
                chain.map((item, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-900 border border-emerald-500/30 text-emerald-300 font-bold">
                    {item.key}: {item.val}
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
        {log}
      </div>
    </div>
  );
};

// =================================================================
// 6. BIG O ASYMPTOTIC COMPLEXITY VISUALIZER
// =================================================================
export const BigOVisualizer: React.FC = () => {
  const [n, setN] = useState<number>(10);

  const complexities = [
    { name: 'O(1)', ops: 1, label: 'Constant', color: 'text-emerald-400 bg-emerald-500/20' },
    { name: 'O(log N)', ops: Math.round(Math.log2(n) * 10) / 10, label: 'Logarithmic', color: 'text-cyan-400 bg-cyan-500/20' },
    { name: 'O(N)', ops: n, label: 'Linear', color: 'text-blue-400 bg-blue-500/20' },
    { name: 'O(N log N)', ops: Math.round(n * Math.log2(n)), label: 'Log-Linear', color: 'text-amber-400 bg-amber-500/20' },
    { name: 'O(N²)', ops: n * n, label: 'Quadratic', color: 'text-rose-400 bg-rose-500/20' },
    { name: 'O(2^N)', ops: n <= 20 ? Math.pow(2, n) : '> 1,000,000', label: 'Exponential', color: 'text-purple-400 bg-purple-500/20' }
  ];

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-slate-900/60 light-theme:bg-white p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Activity className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white light-theme:text-slate-900">
              Big O Growth Curve Comparison
            </h3>
            <p className="text-xs text-slate-400 light-theme:text-slate-600">
              Drag input size N to compare operations required as scale increases
            </p>
          </div>
        </div>

        {/* N Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Input Size N:</span>
          <input
            type="range"
            min={2}
            max={30}
            value={n}
            onChange={e => setN(Number(e.target.value))}
            className="w-32 accent-amber-500"
          />
          <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            {n}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
        {complexities.map(c => (
          <div key={c.name} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">{c.label}</span>
            <span className="text-sm font-black font-mono block text-white">{c.name}</span>
            <div className={`p-1.5 rounded font-black text-xs ${c.color}`}>
              {c.ops.toLocaleString()} ops
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
