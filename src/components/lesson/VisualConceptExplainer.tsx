import React, { useState } from 'react';
import {
  Eye,
  Layers,
  ArrowRight,
  RefreshCw,
  Box,
  Check,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Search,
  Sliders,
  ChevronRight,
  Sparkles,
  GitBranch,
  Cpu,
  Zap,
  Clock,
  Activity,
  Repeat,
  ShieldCheck
} from 'lucide-react';

import {
  LRUCacheVisualizer,
  ComprehensionVisualizer,
  FunctionalPipelineVisualizer,
  DynamicArrayVisualizer,
  HashTableVisualizer,
  BigOVisualizer
} from './IntermediateVisualizers';

import {
  CCompilationPipelineVisualizer,
  CMemoryLayoutVisualizer,
  CExpressionEvaluationVisualizer,
  CCallStackVisualizer,
  CPointerDereferenceVisualizer,
  CDynamicMemoryVisualizer,
  CStructUnionVisualizer,
  StudentRecordSystemVisualizer
} from './CVisualizers';

export interface VisualConceptExplainerProps {
  topicId?: string;
  topicTitle?: string;
  language?: string;
}

export const VisualConceptExplainer: React.FC<VisualConceptExplainerProps> = ({
  topicId = 'top-py-fundamentals',
  topicTitle = 'Datatypes & Immutability',
  language = 'python'
}) => {
  const tId = topicId.toLowerCase();

  // -------------------------------------------------------------
  // C PROGRAMMING FOUNDATIONS VISUALIZERS
  // -------------------------------------------------------------
  if (tId.startsWith('top-c-') || language === 'c') {
    if (tId.includes('project') || tId.includes('student')) {
      return <StudentRecordSystemVisualizer />;
    }
    if (tId.includes('intro') || tId.includes('preprocessor') || tId.includes('compilation')) {
      return <CCompilationPipelineVisualizer />;
    }
    if (tId.includes('pointers') || tId.includes('pointer') || tId.includes('addresses')) {
      return <CPointerDereferenceVisualizer />;
    }
    if (tId.includes('dynamic-memory') || tId.includes('malloc')) {
      return <CDynamicMemoryVisualizer />;
    }
    if (tId.includes('structures') || tId.includes('unions')) {
      return <CStructUnionVisualizer />;
    }
    if (tId.includes('recursion') || tId.includes('stack')) {
      return <CCallStackVisualizer />;
    }
    if (tId.includes('operators') || tId.includes('expressions') || tId.includes('conditionals')) {
      return <CExpressionEvaluationVisualizer />;
    }
    if (tId.includes('variables') || tId.includes('io') || tId.includes('types')) {
      return <CMemoryLayoutVisualizer />;
    }
    if (tId.includes('arrays') || tId.includes('strings')) {
      return <DynamicArrayVisualizer />;
    }
    return <CMemoryLayoutVisualizer />;
  }

  // -------------------------------------------------------------
  // INTERMEDIATE PYTHON & DSA VISUALIZERS
  // -------------------------------------------------------------
  if (tId.includes('mini-project') || tId.includes('lru')) {
    return <LRUCacheVisualizer />;
  }
  if (tId.includes('comprehension')) {
    return <ComprehensionVisualizer />;
  }
  if (tId.includes('lambda') || tId.includes('functional')) {
    return <FunctionalPipelineVisualizer />;
  }
  if (tId.includes('ds-intro') || tId.includes('arrays')) {
    return <DynamicArrayVisualizer />;
  }
  if (tId.includes('hash-table') || tId.includes('dict-internals')) {
    return <HashTableVisualizer />;
  }
  if (tId.includes('big-o') || tId.includes('complexity')) {
    return <BigOVisualizer />;
  }

  // -------------------------------------------------------------
  // ADVANCED PYTHON VISUALIZERS
  // -------------------------------------------------------------
  if (tId.includes('decorator')) {
    return <DecoratorVisualizer />;
  }
  if (tId.includes('generator') || tId.includes('yield') || tId.includes('iterator')) {
    return <GeneratorVisualizer />;
  }
  if (tId.includes('mro') || tId.includes('multiple-inheritance') || (tId.includes('inheritance') && tId.includes('adv'))) {
    return <MroVisualizer />;
  }
  if (tId.includes('event-loop') || tId.includes('coroutine') || tId.includes('gather') || tId.includes('asyncio') || tId.includes('sync-vs-async')) {
    return <EventLoopVisualizer />;
  }
  if (tId.includes('threading') || tId.includes('concurrency') || tId.includes('multiprocessing')) {
    return <ConcurrencyModelVisualizer />;
  }

  // -------------------------------------------------------------
  // 1. STACK VISUALIZER (Push & Pop)
  // -------------------------------------------------------------
  if (tId.includes('stack')) {
    return <StackVisualizer />;
  }

  // -------------------------------------------------------------
  // 2. QUEUE VISUALIZER (Enqueue & Dequeue)
  // -------------------------------------------------------------
  if (tId.includes('queue') && !tId.includes('priority')) {
    return <QueueVisualizer />;
  }

  // -------------------------------------------------------------
  // 3. LINKED LIST VISUALIZER
  // -------------------------------------------------------------
  if (tId.includes('linked-list')) {
    return <LinkedListVisualizer />;
  }

  // -------------------------------------------------------------
  // 4. BINARY SEARCH VISUALIZER
  // -------------------------------------------------------------
  if (tId.includes('searching') || tId.includes('search')) {
    return <BinarySearchVisualizer />;
  }

  // -------------------------------------------------------------
  // 5. SORTING VISUALIZER (Bubble / Insertion / Merge)
  // -------------------------------------------------------------
  if (tId.includes('sorting')) {
    return <SortingVisualizer />;
  }

  // -------------------------------------------------------------
  // 6. BINARY SEARCH TREE VISUALIZER
  // -------------------------------------------------------------
  if (tId.includes('tree') || tId.includes('bst')) {
    return <TreeVisualizer />;
  }

  // -------------------------------------------------------------
  // 7. HEAPS & PRIORITY QUEUES VISUALIZER
  // -------------------------------------------------------------
  if (tId.includes('heap') || tId.includes('priority-queue')) {
    return <HeapVisualizer />;
  }

  // -------------------------------------------------------------
  // 8. RECURSION CALL STACK VISUALIZER
  // -------------------------------------------------------------
  if (tId.includes('recursion')) {
    return <RecursionVisualizer />;
  }

  // -------------------------------------------------------------
  // DEFAULT: MEMORY MODEL / OBJECT REFERENCES VISUALIZER
  // -------------------------------------------------------------
  return <MemoryModelVisualizer topicId={topicId} language={language} />;
};

// =================================================================
// COMPONENT 1: STACK VISUALIZER
// =================================================================
const StackVisualizer: React.FC = () => {
  const [items, setItems] = useState<string[]>(['Frame 1: main()', 'Frame 2: calculate()', 'Frame 3: format()']);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('Stack initialized with 3 frames. Last-In First-Out (LIFO).');

  const handlePush = (val?: string) => {
    const text = val || inputValue.trim() || `Item ${items.length + 1}`;
    if (items.length >= 6) {
      setMessage('Stack Overflow Warning: Reached visual limit of 6 items.');
      return;
    }
    setItems(prev => [...prev, text]);
    setInputValue('');
    setMessage(`PUSH: Added "${text}" to top of stack (O(1)).`);
  };

  const handlePop = () => {
    if (items.length === 0) {
      setMessage('Stack Underflow Warning: Cannot pop from an empty stack!');
      return;
    }
    const popped = items[items.length - 1];
    setItems(prev => prev.slice(0, prev.length - 1));
    setMessage(`POP: Removed top item "${popped}" from stack (O(1)).`);
  };

  const handleReset = () => {
    setItems(['Frame 1: main()', 'Frame 2: calculate()']);
    setMessage('Stack reset.');
  };

  return (
    <div id="section-visual" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Stack Visualizer (LIFO)</h3>
            <p className="text-[11px] text-slate-400">Push elements onto the top and pop the most recent element</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePush()}
            className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Push
          </button>
          <button
            onClick={handlePop}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Pop
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status banner */}
      <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>{message}</span>
      </div>

      {/* Visual Stack Chamber */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 flex flex-col items-center">
          <div className="w-full max-w-sm rounded-b-2xl border-x-2 border-b-2 border-dashed border-cyan-500/60 p-4 min-h-[220px] flex flex-col-reverse gap-2 bg-slate-950/60 shadow-inner">
            {items.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-600 font-mono italic my-auto">
                (Stack is empty)
              </div>
            ) : (
              items.map((item, idx) => {
                const isTop = idx === items.length - 1;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs transition-all animate-pop-in ${
                      isTop
                        ? 'border-cyan-400 bg-gradient-to-r from-cyan-950/70 to-blue-950/50 text-white shadow-lg shadow-cyan-500/20'
                        : 'border-slate-800 bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-800 text-[10px] text-slate-400 flex items-center justify-center">
                        #{idx}
                      </span>
                      <span className="font-bold">{item}</span>
                    </div>
                    {isTop && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        Top Pointer ←
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-2">Stack Base (Closed End)</span>
        </div>

        {/* Stack Metrics */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <div className="text-slate-400 border-b border-slate-800 pb-1.5 font-bold">Stack State:</div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Items:</span>
            <span className="text-cyan-400 font-bold">{items.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Peek (Top):</span>
            <span className="text-white truncate max-w-[120px]">{items[items.length - 1] || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Is Empty?</span>
            <span className={items.length === 0 ? 'text-amber-400' : 'text-emerald-400'}>
              {items.length === 0 ? 'True' : 'False'}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            Operations operate strictly on the top element, guaranteeing <strong>O(1)</strong> time complexity for push and pop.
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 2: QUEUE VISUALIZER
// =================================================================
const QueueVisualizer: React.FC = () => {
  const [items, setItems] = useState<string[]>(['Request #1', 'Request #2', 'Request #3']);
  const [message, setMessage] = useState('Queue initialized with 3 requests. First-In First-Out (FIFO).');

  const handleEnqueue = () => {
    if (items.length >= 6) {
      setMessage('Queue Full: Maximum capacity reached for demonstration.');
      return;
    }
    const nextItem = `Request #${Math.floor(Math.random() * 900) + 100}`;
    setItems(prev => [...prev, nextItem]);
    setMessage(`ENQUEUE: Added "${nextItem}" to rear of queue (O(1)).`);
  };

  const handleDequeue = () => {
    if (items.length === 0) {
      setMessage('Queue Underflow: Cannot dequeue from an empty queue!');
      return;
    }
    const removed = items[0];
    setItems(prev => prev.slice(1));
    setMessage(`DEQUEUE: Served and removed front item "${removed}" (O(1)).`);
  };

  return (
    <div id="section-visual" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Queue Visualizer (FIFO)</h3>
            <p className="text-[11px] text-slate-400">Enqueue at rear, Dequeue from front in constant O(1) time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEnqueue}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Enqueue (Rear)
          </button>
          <button
            onClick={handleDequeue}
            className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1 transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5" /> Dequeue (Front)
          </button>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs font-mono text-indigo-300">
        {message}
      </div>

      {/* Horizontal Queue Conveyor */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="text-emerald-400 font-bold">← FRONT (Next to exit)</span>
          <span className="text-indigo-400 font-bold">REAR (New items arrive) →</span>
        </div>

        <div className="min-h-[90px] border-y-2 border-dashed border-slate-800 flex items-center gap-3 overflow-x-auto p-3">
          {items.length === 0 ? (
            <div className="w-full text-center text-xs text-slate-600 font-mono italic">
              Queue is empty. Click Enqueue to add requests.
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border shrink-0 min-w-[130px] font-mono text-xs transition-all animate-pop-in ${
                  idx === 0
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-200 shadow-md shadow-emerald-950/30'
                    : idx === items.length - 1
                    ? 'border-indigo-500 bg-indigo-950/30 text-indigo-200 shadow-md shadow-indigo-950/30'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                  <span>Slot #{idx}</span>
                  {idx === 0 && <span className="text-emerald-400 font-bold">Front</span>}
                  {idx === items.length - 1 && idx !== 0 && (
                    <span className="text-indigo-400 font-bold">Rear</span>
                  )}
                </div>
                <div className="font-bold text-white truncate">{item}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 3: LINKED LIST VISUALIZER
// =================================================================
const LinkedListVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<number[]>([10, 20, 30, 40]);
  const [message, setMessage] = useState('Linked list with 4 nodes chained by pointers in heap memory.');

  const handlePrepend = () => {
    const val = Math.floor(Math.random() * 90) + 10;
    setNodes(prev => [val, ...prev]);
    setMessage(`PREPEND: Created Node(${val}) and updated Head pointer in O(1) time.`);
  };

  const handleAppend = () => {
    const val = Math.floor(Math.random() * 90) + 10;
    setNodes(prev => [...prev, val]);
    setMessage(`APPEND: Traversed to tail and attached Node(${val}) in O(n) time.`);
  };

  const handleDeleteHead = () => {
    if (nodes.length === 0) return;
    const removed = nodes[0];
    setNodes(prev => prev.slice(1));
    setMessage(`DELETE: Unlinked head Node(${removed}) in O(1) time.`);
  };

  return (
    <div id="section-visual" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <GitBranch className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Linked List Visualizer</h3>
            <p className="text-[11px] text-slate-400">Node objects with data payloads and next pointers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrepend}
            className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Prepend O(1)
          </button>
          <button
            onClick={handleAppend}
            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
          >
            Append
          </button>
          <button
            onClick={handleDeleteHead}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs"
          >
            Del Head
          </button>
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs font-mono text-purple-300">
        {message}
      </div>

      {/* Nodes chain */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto flex items-center gap-2 min-h-[110px]">
        <div className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold shrink-0">
          HEAD
        </div>
        <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />

        {nodes.map((val, idx) => (
          <React.Fragment key={idx}>
            <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs font-mono shrink-0 shadow-lg">
              <div className="px-3 py-1.5 bg-slate-950 rounded-lg text-white font-bold text-sm">
                {val}
              </div>
              <div className="px-2 text-[10px] text-purple-400 border-l border-slate-800 flex items-center gap-1 font-semibold">
                next
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />
          </React.Fragment>
        ))}

        <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-xs font-mono font-bold shrink-0">
          None
        </div>
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 4: BINARY SEARCH VISUALIZER
// =================================================================
const BinarySearchVisualizer: React.FC = () => {
  const array = [4, 9, 15, 23, 38, 45, 56, 67, 78, 89, 94];
  const [target, setTarget] = useState<number>(45);
  const [low, setLow] = useState<number>(0);
  const [high, setHigh] = useState<number>(array.length - 1);
  const [stepCount, setStepCount] = useState<number>(0);
  const [found, setFound] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);

  const mid = Math.floor((low + high) / 2);

  const handleStep = () => {
    if (done || low > high) return;
    setStepCount(prev => prev + 1);

    if (array[mid] === target) {
      setFound(true);
      setDone(true);
    } else if (array[mid] < target) {
      setLow(mid + 1);
      if (mid + 1 > high) setDone(true);
    } else {
      setHigh(mid - 1);
      if (low > mid - 1) setDone(true);
    }
  };

  const handleReset = (newTarget: number = target) => {
    setLow(0);
    setHigh(array.length - 1);
    setStepCount(0);
    setFound(false);
    setDone(false);
    setTarget(newTarget);
  };

  return (
    <div id="section-visual" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Search className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Binary Search (O(log n))</h3>
            <p className="text-[11px] text-slate-400">Step through logarithmic search space halving</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStep}
            disabled={done}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-40"
          >
            Step Forward
          </button>
          <button
            onClick={() => handleReset()}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Target Selector Bar */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-mono">Select Target:</span>
        {[15, 45, 78, 94, 99].map(num => (
          <button
            key={num}
            onClick={() => handleReset(num)}
            className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
              target === num
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Array Elements Grid */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="grid grid-cols-11 gap-1.5 sm:gap-2">
          {array.map((val, idx) => {
            const isMid = idx === mid && !done;
            const isLow = idx === low;
            const isHigh = idx === high;
            const inRange = idx >= low && idx <= high;
            const isTargetMatch = found && idx === mid;

            return (
              <div
                key={idx}
                className={`p-2 sm:p-3 rounded-xl border text-center font-mono text-xs transition-all ${
                  isTargetMatch
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-black shadow-lg shadow-emerald-500/30'
                    : isMid
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold shadow-md'
                    : inRange
                    ? 'border-slate-700 bg-slate-900 text-white'
                    : 'border-slate-800/40 bg-slate-950 text-slate-600 opacity-40'
                }`}
              >
                <div className="text-[9px] text-slate-500">[{idx}]</div>
                <div className="text-sm sm:text-base font-bold my-1">{val}</div>
                <div className="text-[9px] font-bold">
                  {isMid ? 'MID' : isLow ? 'LOW' : isHigh ? 'HIGH' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Status */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-center justify-between">
        <div>
          Step #{stepCount}: Checking mid = {array[mid]} (index {mid}) vs target {target}
        </div>
        {found && <span className="text-emerald-400 font-bold">✔ Target Found!</span>}
        {done && !found && <span className="text-rose-400 font-bold">✖ Target Not Present</span>}
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 5: SORTING VISUALIZER (Bubble Sort)
// =================================================================
const SortingVisualizer: React.FC = () => {
  const initial = [42, 12, 88, 25, 60, 5, 34];
  const [array, setArray] = useState<number[]>([...initial]);
  const [i, setI] = useState<number>(0);
  const [j, setJ] = useState<number>(0);
  const [isSorted, setIsSorted] = useState<boolean>(false);

  const handleStep = () => {
    if (isSorted) return;
    const arr = [...array];
    const n = arr.length;

    if (arr[j] > arr[j + 1]) {
      // Swap
      const temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
      setArray(arr);
    }

    if (j < n - i - 2) {
      setJ(j + 1);
    } else {
      setJ(0);
      if (i < n - 2) {
        setI(i + 1);
      } else {
        setIsSorted(true);
      }
    }
  };

  const handleReset = () => {
    setArray([...initial]);
    setI(0);
    setJ(0);
    setIsSorted(false);
  };

  return (
    <div id="section-visual" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sliders className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Interactive Sorting Visualizer (Bubble Sort)</h3>
            <p className="text-[11px] text-slate-400">Compare adjacent pairs and bubble largest values to the end</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStep}
            disabled={isSorted}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-40"
          >
            Step Compare / Swap
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 h-48 flex items-end justify-center gap-3 sm:gap-4">
        {array.map((val, idx) => {
          const isComparing = (idx === j || idx === j + 1) && !isSorted;
          const heightPercent = Math.max(15, Math.round((val / 100) * 100));

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[50px]">
              <span className="font-mono text-[11px] text-slate-400 font-bold">{val}</span>
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-xl transition-all duration-200 ${
                  isSorted
                    ? 'bg-emerald-400 shadow-md shadow-emerald-500/30'
                    : isComparing
                    ? 'bg-amber-400 shadow-lg shadow-amber-500/50 scale-105'
                    : 'bg-cyan-500/80'
                }`}
              />
              <span className="font-mono text-[10px] text-slate-600">[{idx}]</span>
            </div>
          );
        })}
      </div>

      <div className="text-xs font-mono text-slate-400 text-center">
        {isSorted ? (
          <span className="text-emerald-400 font-bold">✔ Array is fully sorted!</span>
        ) : (
          <span>Comparing elements at index {j} and {j + 1}</span>
        )}
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 6: TREE VISUALIZER (BST)
// =================================================================
const TreeVisualizer: React.FC = () => {
  return (
    <div id="section-visual" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
          <GitBranch className="w-4 h-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-white">Binary Search Tree (BST) Architecture</h3>
          <p className="text-[11px] text-slate-400">Left subtree &lt; Root &lt; Right subtree invariant</p>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center space-y-3 font-mono">
        {/* Root */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 text-cyan-200 font-bold flex items-center justify-center text-sm shadow-lg shadow-cyan-500/20">
            50
          </div>
          <span className="text-[10px] text-slate-500 mt-1">ROOT</span>
        </div>

        {/* Level 1 branches */}
        <div className="flex items-center justify-center gap-16 sm:gap-28 w-full max-w-md pt-2">
          {/* Left Child */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border-2 border-purple-400 text-purple-200 font-bold flex items-center justify-center text-xs">
              30
            </div>
            <span className="text-[9px] text-purple-400 mt-1">Left (&lt; 50)</span>
          </div>

          {/* Right Child */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border-2 border-purple-400 text-purple-200 font-bold flex items-center justify-center text-xs">
              70
            </div>
            <span className="text-[9px] text-purple-400 mt-1">Right (&gt; 50)</span>
          </div>
        </div>

        {/* Level 2 leaves */}
        <div className="flex items-center justify-around w-full max-w-lg pt-2 text-[10px]">
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">20</div>
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">40</div>
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">60</div>
          <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">80</div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
        <span>In-Order Traversal (Sorted):</span>
        <span className="text-cyan-400 font-bold">[20, 30, 40, 50, 60, 70, 80]</span>
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 7: HEAP VISUALIZER
// =================================================================
const HeapVisualizer: React.FC = () => {
  const heap = [10, 20, 15, 30, 40, 50];
  return (
    <div id="section-visual" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
          <Layers className="w-4 h-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-white">Min-Heap Array Mapping (heapq)</h3>
          <p className="text-[11px] text-slate-400">Complete binary tree stored compactly in a flat Python list</p>
        </div>
      </div>

      {/* Flat Array Representation */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="text-[11px] font-mono text-slate-400 font-bold">List Representation:</div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {heap.map((val, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center font-mono text-xs min-w-[50px] ${
                idx === 0
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                  : 'border-slate-800 bg-slate-900 text-white'
              }`}
            >
              <div className="text-[9px] text-slate-500">[{idx}]</div>
              <div className="text-sm font-bold my-0.5">{val}</div>
              {idx === 0 && <div className="text-[9px] text-amber-400 font-bold">MIN ROOT</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
        Formula for child nodes: Left Child = <code>2*i + 1</code> | Right Child = <code>2*i + 2</code>
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 8: RECURSION CALL STACK VISUALIZER
// =================================================================
const RecursionVisualizer: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const frames = [
    { call: 'factorial(4)', note: 'Initial invocation, waiting for factorial(3)', returning: null },
    { call: 'factorial(3)', note: 'Pushed to stack, waiting for factorial(2)', returning: null },
    { call: 'factorial(2)', note: 'Pushed to stack, waiting for factorial(1)', returning: null },
    { call: 'factorial(1)', note: 'BASE CASE HIT! Returns 1 immediately', returning: '1' },
    { call: 'Unwinding factorial(2)', note: 'Receives 1, returns 2 * 1 = 2', returning: '2' },
    { call: 'Unwinding factorial(3)', note: 'Receives 2, returns 3 * 2 = 6', returning: '6' },
    { call: 'Unwinding factorial(4)', note: 'Receives 6, returns 4 * 6 = 24', returning: '24' }
  ];

  return (
    <div id="section-visual" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Recursion Call Stack Trace: factorial(4)</h3>
            <p className="text-[11px] text-slate-400">Frames accumulate during descent and pop during unwinding</p>
          </div>
        </div>
        <button
          onClick={() => setStep((step + 1) % frames.length)}
          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5"
        >
          Next Frame ({step + 1}/{frames.length})
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
        <div className="text-rose-400 font-bold">{frames[step].call}</div>
        <div className="text-slate-300">{frames[step].note}</div>
        {frames[step].returning && (
          <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-bold">
            Return Value: {frames[step].returning}
          </div>
        )}
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 9: MEMORY MODEL VISUALIZER (Fallback / Fundamental)
// =================================================================
const MemoryModelVisualizer: React.FC<{ topicId: string; language: string }> = ({ topicId, language }) => {
  const [step, setStep] = useState<number>(0);
  const lang = (language || (topicId.includes('-c-') ? 'c' : topicId.includes('-cpp-') ? 'cpp' : topicId.includes('-java-') ? 'java' : 'python')).toLowerCase();

  const steps = [
    {
      title: 'Step 1: Creating variable a = 100',
      description: 'Python creates an integer object 100 in heap memory and assigns variable "a" as a reference tag pointing to it.',
      variableA: { name: 'a', targetAddr: '0x10A4', val: '100' },
      variableB: null,
      heapObjects: [
        { addr: '0x10A4', type: 'int', val: '100', refCount: 1, isTargetA: true, isTargetB: false }
      ]
    },
    {
      title: 'Step 2: Assigning b = a (Reference Sharing)',
      description: 'Python does NOT make a duplicate copy of 100. Instead, "b" points to the exact same memory address (0x10A4). Notice `a is b` evaluates to True!',
      variableA: { name: 'a', targetAddr: '0x10A4', val: '100' },
      variableB: { name: 'b', targetAddr: '0x10A4', val: '100' },
      heapObjects: [
        { addr: '0x10A4', type: 'int', val: '100', refCount: 2, isTargetA: true, isTargetB: true }
      ]
    },
    {
      title: 'Step 3: Rebinding a = a + 1 (Immutability in Action)',
      description: 'Because integers are immutable, Python CANNOT change 100 to 101 in-place. It allocates a BRAND NEW object 101 at 0x20C8 and rebinds "a" to it! Variable "b" still refers to 100.',
      variableA: { name: 'a', targetAddr: '0x20C8', val: '101' },
      variableB: { name: 'b', targetAddr: '0x10A4', val: '100' },
      heapObjects: [
        { addr: '0x10A4', type: 'int', val: '100', refCount: 1, isTargetA: false, isTargetB: true },
        { addr: '0x20C8', type: 'int', val: '101', refCount: 1, isTargetA: true, isTargetB: false }
      ]
    }
  ];

  const currentStep = steps[step];

  return (
    <div id="section-visual" className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Eye className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Visual Conceptual Model: Object References & Memory</h3>
            <p className="text-[11px] text-slate-400">Interactive demonstration of how variables act as pointer tags in memory</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setStep(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                step === idx ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setStep((step + 1) % steps.length)}
            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Next Step"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs leading-relaxed text-indigo-200">
        <strong className="block font-bold mb-0.5">{currentStep.title}</strong>
        {currentStep.description}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-1.5">
            <span>Namespace (Variables)</span>
            <span className="text-[10px] text-cyan-400">Tags / Labels</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border-2 border-cyan-500/50">
              <span className="text-xs text-slate-300 font-medium">Variable "a"</span>
              <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400 font-bold">
                <span>points to</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px]">{currentStep.variableA.targetAddr}</span>
              </div>
            </div>

            {currentStep.variableB && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border-2 border-purple-500/50">
                <span className="text-xs text-slate-300 font-medium">Variable "b"</span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-purple-400 font-bold">
                  <span>points to</span>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px]">{currentStep.variableB.targetAddr}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-1.5">
            <span>Heap Memory Objects</span>
            <span className="text-[10px] text-emerald-400">Allocated Memory</span>
          </div>

          <div className="space-y-2.5">
            {currentStep.heapObjects.map(obj => (
              <div
                key={obj.addr}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900 text-xs font-mono space-y-1"
              >
                <div className="flex justify-between text-slate-400">
                  <span>type: {obj.type}</span>
                  <span className="text-[10px] text-slate-500">addr: {obj.addr}</span>
                </div>
                <div className="text-base font-bold text-white">val = {obj.val}</div>
                <div className="text-[10px] text-slate-500">Ref count: {obj.refCount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 9: DECORATOR VISUALIZER
// =================================================================
const DecoratorVisualizer: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const steps = [
    {
      title: '1. Base Function Definition',
      desc: 'def fetch_data(): returns raw data. At this point, the base function exists unmodified.',
      wrapperActive: false,
      baseActive: true,
      phase: 'standby',
      callStack: ['fetch_data defined'],
      output: 'Waiting for invocation...'
    },
    {
      title: '2. Decorator Wrapping (@timer)',
      desc: 'Python evaluates fetch_data = timer(fetch_data). The base function is passed as a closure reference into the wrapper function.',
      wrapperActive: true,
      baseActive: false,
      phase: 'wrapping',
      callStack: ['timer(fetch_data) -> wrapper(*args)'],
      output: '[Decorated] fetch_data is now wrapper closure'
    },
    {
      title: '3. Pre-execution Hook (Before Call)',
      desc: 'Wrapper intercepts call. Executes pre-logic: start_time = time.perf_counter(), logs entry, validates auth or cache.',
      wrapperActive: true,
      baseActive: false,
      phase: 'pre',
      callStack: ['wrapper() invoked', 'start_time = perf_counter()', 'log("Executing fetch_data...")'],
      output: '⏱️ [Timer] Starting execution stopwatch...'
    },
    {
      title: '4. Underlying Base Function Execution',
      desc: 'Wrapper calls original func(*args, **kwargs). Core business logic executes and produces return value.',
      wrapperActive: true,
      baseActive: true,
      phase: 'base',
      callStack: ['wrapper()', '-> original_func() [FETCHING 200 RECORDS...]'],
      output: '📦 Database query complete: {"status": 200, "rows": 200}'
    },
    {
      title: '5. Post-execution Hook & Return',
      desc: 'Wrapper calculates duration = perf_counter() - start_time, logs elapsed time, and returns the result to caller.',
      wrapperActive: true,
      baseActive: false,
      phase: 'post',
      callStack: ['duration = 0.042s', 'log(f"Finished in {duration}s")', 'return result'],
      output: '✅ Done! Execution time: 0.042s. Result handed to caller seamlessly.'
    }
  ];

  const current = steps[step];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h4 className="text-base font-bold text-white">Decorator Execution Pipeline Visualizer</h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize how closures wrap underlying functions with pre- and post-processing hooks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 transition"
          >
            Prev Step
          </button>
          <button
            onClick={() => setStep(prev => (prev + 1) % steps.length)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition shadow-lg shadow-cyan-900/30"
          >
            <span>{step === steps.length - 1 ? 'Restart' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStep(0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visual Pipeline Container */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">{current.title}</span>
            <span className="text-xs font-mono text-slate-500">Step {step + 1} of {steps.length}</span>
          </div>

          {/* Concentric Box Representation of Decorator Wrapping */}
          <div className="relative p-6 rounded-2xl border-2 transition-all duration-300 bg-slate-900/80 mb-4"
            style={{
              borderColor: current.wrapperActive ? '#06b6d4' : '#334155',
              boxShadow: current.wrapperActive ? '0 0 25px rgba(6, 182, 212, 0.15)' : 'none'
            }}
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold mb-3">
              <span className={current.wrapperActive ? 'text-cyan-400' : 'text-slate-400'}>
                🛡️ Outer Decorator Wrapper: @timer (functools.wraps)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Phase: {current.phase}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 mb-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
              {current.phase === 'pre' && <span className="text-amber-400">⚡ [PRE-HOOK] start_time = perf_counter(); log_request()</span>}
              {current.phase === 'base' && <span className="text-slate-500">⏳ Handed control to wrapped function...</span>}
              {current.phase === 'post' && <span className="text-emerald-400">✨ [POST-HOOK] elapsed = perf_counter() - start; return result</span>}
              {current.phase !== 'pre' && current.phase !== 'base' && current.phase !== 'post' && (
                <span className="text-slate-500">def wrapper(*args, **kwargs): ready</span>
              )}
            </div>

            {/* Inner Base Function Box */}
            <div
              className="p-5 rounded-xl border-2 transition-all duration-300"
              style={{
                borderColor: current.baseActive ? '#a855f7' : '#1e293b',
                backgroundColor: current.baseActive ? 'rgba(168, 85, 247, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                boxShadow: current.baseActive ? '0 0 20px rgba(168, 85, 247, 0.2)' : 'none'
              }}
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-purple-400 mb-2">
                <span>📦 Core Function: fetch_data()</span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${current.baseActive ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-500'}`}>
                  {current.baseActive ? 'RUNNING' : 'IDLE'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                {current.desc}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Terminal Output:</span>
            <span className="text-emerald-400 font-semibold">{current.output}</span>
          </div>
        </div>

        {/* Stack and Closure State */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
              <span>Active Call Stack</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="space-y-2">
              {current.callStack.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400 mb-1 font-bold">Decorator Benefits:</div>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Separation of concerns (DRY)</li>
              <li>Non-intrusive logging & metrics</li>
              <li>Reusability across API routes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 10: GENERATOR & YIELD VISUALIZER
// =================================================================
const GeneratorVisualizer: React.FC = () => {
  const [genIndex, setGenIndex] = useState<number>(0);
  const [yieldHistory, setYieldHistory] = useState<number[]>([]);
  const values = [1, 4, 9, 16, 25, 36, 49];

  const handleNext = () => {
    if (genIndex < values.length) {
      setYieldHistory(prev => [...prev, values[genIndex]]);
      setGenIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setGenIndex(0);
    setYieldHistory([]);
  };

  const isExhausted = genIndex >= values.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-cyan-400" />
            <h4 className="text-base font-bold text-white">Generator Lazy Evaluation & yield Visualizer</h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Generators pause execution state and produce values on-demand with O(1) memory overhead.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNext}
            disabled={isExhausted}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-semibold text-white transition shadow-lg shadow-cyan-900/30"
          >
            <Play className="w-3.5 h-3.5" />
            <span>next(gen)</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Reset Generator"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Generator Internal State */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-slate-300">Generator Frame Pointer State</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isExhausted ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
              {isExhausted ? 'GEN_CLOSED (StopIteration)' : genIndex === 0 ? 'GEN_CREATED' : 'GEN_SUSPENDED (Yielded)'}
            </span>
          </div>

          {/* Generator Code Block with Pointer */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-1">
            <div className="text-slate-500">def square_stream(n):</div>
            <div className="text-slate-400 pl-4">for i in range(1, n + 1):</div>
            <div className={`pl-8 py-1 rounded transition flex items-center justify-between ${!isExhausted && genIndex > 0 ? 'bg-cyan-950/80 text-cyan-300 border-l-2 border-cyan-400 font-bold' : 'text-slate-300'}`}>
              <span>yield i ** 2  # Current value: {genIndex > 0 ? values[genIndex - 1] : 'Waiting next()'}</span>
              {!isExhausted && genIndex > 0 && <span className="text-[10px] text-cyan-400">◀ PAUSED HERE</span>}
            </div>
            <div className="text-slate-500">gen = square_stream(7)</div>
          </div>

          {/* Visual Sequence of Yielded Elements */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 font-bold">Yielded Stream Stream Buffer:</div>
            <div className="flex flex-wrap gap-2 min-h-[44px] items-center p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              {yieldHistory.length === 0 ? (
                <span className="text-xs text-slate-600 font-mono italic">No values yielded yet. Click next(gen) above.</span>
              ) : (
                yieldHistory.map((val, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-900/60 to-purple-900/60 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-bold animate-in fade-in"
                  >
                    {val}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Memory Comparison Panel */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-2">
              Memory Footprint Comparison
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-bold text-rose-400">
                <span>List Comprehension</span>
                <span>O(N) RAM</span>
              </div>
              <p className="text-[11px] text-slate-400">
                [x**2 for x in range(10_000_000)] allocates all 10 million integers in heap memory immediately (~800 MB).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/40 space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-bold text-cyan-400">
                <span>Generator Expression</span>
                <span>O(1) RAM</span>
              </div>
              <p className="text-[11px] text-slate-400">
                (x**2 for x in range(10_000_000)) holds only current counter state in 112 bytes regardless of stream size.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            Status: {isExhausted ? 'Stream Complete (StopIteration)' : `${values.length - genIndex} elements remaining`}
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 11: METHOD RESOLUTION ORDER (MRO) VISUALIZER
// =================================================================
const MroVisualizer: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<'D' | 'B' | 'C' | 'A'>('D');
  
  const mroOrders = {
    D: ['D', 'B', 'C', 'A', 'object'],
    B: ['B', 'A', 'object'],
    C: ['C', 'A', 'object'],
    A: ['A', 'object']
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-400" />
            <h4 className="text-base font-bold text-white">Method Resolution Order (MRO) & C3 Linearization</h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize Python's C3 Linearization algorithm for multiple inheritance and diamond hierarchies.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['D', 'B', 'C', 'A'] as const).map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${selectedClass === cls ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Class {cls}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Diamond Inheritance Tree Diagram */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-2">
            Inheritance Hierarchy: Diamond Pattern (class D(B, C))
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-3 font-mono text-xs">
            {/* Top Root: A */}
            <div className={`px-4 py-2 rounded-xl border-2 transition ${mroOrders[selectedClass].includes('A') ? 'border-amber-400/80 bg-amber-950/20 text-amber-300 font-bold' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
              Class A (root)
            </div>

            <div className="flex gap-16 text-slate-600 text-sm">
              <span>↙</span>
              <span>↘</span>
            </div>

            {/* Middle Branch: B and C */}
            <div className="flex gap-12">
              <div className={`px-4 py-2 rounded-xl border-2 transition ${mroOrders[selectedClass].includes('B') ? 'border-cyan-400/80 bg-cyan-950/20 text-cyan-300 font-bold' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
                Class B(A)
              </div>
              <div className={`px-4 py-2 rounded-xl border-2 transition ${mroOrders[selectedClass].includes('C') ? 'border-purple-400/80 bg-purple-950/20 text-purple-300 font-bold' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
                Class C(A)
              </div>
            </div>

            <div className="flex gap-16 text-slate-600 text-sm">
              <span>↘</span>
              <span>↙</span>
            </div>

            {/* Child Leaf: D */}
            <div className={`px-5 py-2.5 rounded-xl border-2 transition ${selectedClass === 'D' ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300 font-bold shadow-lg shadow-emerald-950/50' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
              Class D(B, C) [Target Instance]
            </div>
          </div>

          {/* Linearization Result Ribbon */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1.5 font-bold">
              Computed MRO ({selectedClass}.__mro__):
            </span>
            <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
              {mroOrders[selectedClass].map((c, i) => (
                <React.Fragment key={c}>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                    {c}
                  </span>
                  {i < mroOrders[selectedClass].length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Explanations */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-2">
              C3 Rules & super() Call Chain
            </div>
            <div className="text-xs text-slate-300 space-y-2">
              <p>
                <strong className="text-cyan-400">1. Local Precedence:</strong> Classes are resolved in the order listed in subclass definition (B before C).
              </p>
              <p>
                <strong className="text-purple-400">2. Monotonicity:</strong> A parent class is never searched before any of its children.
              </p>
              <p>
                <strong className="text-amber-400">3. Cooperative super():</strong> In class B, <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">super()</code> invokes <strong>Class C</strong>, NOT Class A!
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400">
            <code>print({selectedClass}.mro())</code>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 12: ASYNCIO EVENT LOOP VISUALIZER
// =================================================================
const EventLoopVisualizer: React.FC = () => {
  const [activeCycle, setActiveCycle] = useState<number>(0);

  const cycles = [
    {
      label: '1. Event Loop Startup',
      loopStatus: 'Polling Ready Queue',
      callStack: 'asyncio.run(main())',
      readyQueue: ['Task-1: fetch_user()', 'Task-2: fetch_orders()', 'Task-3: fetch_notifications()'],
      waitingIO: [],
      explanation: 'The Event Loop starts on the main thread and registers the three asynchronous tasks scheduled by asyncio.gather().'
    },
    {
      label: '2. Task-1 Yields at await',
      loopStatus: 'Non-blocking I/O Dispatch',
      callStack: 'await aiohttp.get(url_user)',
      readyQueue: ['Task-2: fetch_orders()', 'Task-3: fetch_notifications()'],
      waitingIO: ['Socket FD 4 (User API Socket - awaiting HTTP response)'],
      explanation: 'Task-1 reaches an "await" statement on a network socket. It cooperatively pauses and yields control back to the event loop!'
    },
    {
      label: '3. Task-2 Yields at await',
      loopStatus: 'Switching Tasks without Thread Context Switch',
      callStack: 'await aiohttp.get(url_orders)',
      readyQueue: ['Task-3: fetch_notifications()'],
      waitingIO: ['Socket FD 4 (User API)', 'Socket FD 5 (Orders DB Query)'],
      explanation: 'The event loop immediately pops Task-2 from the ready queue. Zero thread-blocking occurs.'
    },
    {
      label: '4. Task-3 Runs & I/O Resolves',
      loopStatus: 'OS Epoll / Selector Poll Notification',
      callStack: 'Task-3 processing JSON data',
      readyQueue: ['Task-1: Resume (HTTP 200 Received)'],
      waitingIO: ['Socket FD 5 (Orders DB Query)'],
      explanation: 'Operating system (epoll/kqueue) signals socket data is ready. Event loop pushes Task-1 callback back to the ready queue!'
    },
    {
      label: '5. All Tasks Resolved',
      loopStatus: 'Tasks Completed & Gathered',
      callStack: 'return results [user, orders, notifs]',
      readyQueue: [],
      waitingIO: [],
      explanation: 'All concurrent futures are fulfilled. Total elapsed time equals MAX(tasks) instead of SUM(tasks).'
    }
  ];

  const current = cycles[activeCycle];

  const handleNextCycle = () => {
    setActiveCycle(prev => (prev + 1) % cycles.length);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h4 className="text-base font-bold text-white">Asyncio Event Loop & Cooperative Concurrency</h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Single-threaded cooperative multitasking using epoll/kqueue and coroutine suspends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNextCycle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition shadow-lg shadow-cyan-900/30"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Cycle Event Loop ({activeCycle + 1}/{cycles.length})</span>
          </button>
          <button
            onClick={() => setActiveCycle(0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Event Loop Centerpiece */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-cyan-400">{current.label}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {current.loopStatus}
            </span>
          </div>

          {/* Visual Event Loop Wheel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                <span>⚡ Active Execution Stack</span>
                <span className="text-[10px] text-amber-400">Main Thread</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/40 text-xs font-mono text-amber-300 font-bold">
                {current.callStack}
              </div>
              <p className="text-[11px] text-slate-400">
                The Python thread never blocks while awaiting external network or file descriptors.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                <span>📋 Ready Task Queue</span>
                <span className="text-[10px] text-cyan-400">{current.readyQueue.length} Ready</span>
              </div>
              <div className="space-y-1.5 min-h-[70px]">
                {current.readyQueue.length === 0 ? (
                  <div className="text-xs text-slate-600 font-mono italic p-2">Ready queue empty.</div>
                ) : (
                  current.readyQueue.map((t, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
                      {t}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Non-blocking I/O Waiting Descriptors */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <span>🌐 OS Selector / I/O Wait Pool (Epoll/KQueue)</span>
              <span className="text-[10px] text-purple-400">{current.waitingIO.length} Polling</span>
            </div>
            <div className="space-y-1">
              {current.waitingIO.length === 0 ? (
                <div className="text-xs text-slate-600 font-mono italic">No pending OS file descriptor interrupts.</div>
              ) : (
                current.waitingIO.map((w, idx) => (
                  <div key={idx} className="p-2 rounded bg-purple-950/30 border border-purple-800 text-[11px] font-mono text-purple-300">
                    {w}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <strong className="text-cyan-400 font-mono">Mechanism: </strong>
            {current.explanation}
          </div>
        </div>

        {/* Benefits & Comparison */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-2">
              Asyncio Architecture Highlights
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-0.5">Zero OS Thread Overhead</span>
                <span className="text-[11px] text-slate-400">Can handle 100,000 concurrent sockets using only megabytes of RAM.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-purple-400 block mb-0.5">No Race Conditions on State</span>
                <span className="text-[11px] text-slate-400">Switching happens only explicitly at <code>await</code> points.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="font-bold text-amber-400 block mb-0.5">Cooperative vs Preemptive</span>
                <span className="text-[11px] text-slate-400">CPU-heavy tasks must use <code>run_in_executor</code> or Multiprocessing to avoid stalling loop.</span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-900 text-center text-[10px] font-mono text-slate-500">
            asyncio.gather(*tasks) → concurrent resolution
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// COMPONENT 13: CONCURRENCY MODEL COMPARISON VISUALIZER
// =================================================================
const ConcurrencyModelVisualizer: React.FC = () => {
  const [model, setModel] = useState<'sync' | 'threading' | 'multiprocessing' | 'asyncio'>('asyncio');

  const modelData = {
    sync: {
      name: 'Sequential Execution',
      desc: 'Each task blocks execution completely until finished. 3 tasks of 2 seconds take 6.0 seconds total.',
      gil: 'N/A (Single execution stream)',
      memory: 'Minimal (Single process)',
      bestFor: 'Simple scripts, pure sequential algorithms',
      timeline: [
        { label: 'Task 1 (I/O Wait)', color: 'bg-rose-500', width: '33%' },
        { label: 'Task 2 (I/O Wait)', color: 'bg-amber-500', width: '33%' },
        { label: 'Task 3 (I/O Wait)', color: 'bg-purple-500', width: '33%' }
      ],
      totalTime: '6.0s (Sum of all tasks)'
    },
    threading: {
      name: 'Multithreading (threading)',
      desc: 'OS threads in same process. Constrained by the Global Interpreter Lock (GIL) — only one thread executes Python bytecode at once, but releases GIL during I/O.',
      gil: 'GIL switches every 5ms (sys.getswitchinterval)',
      memory: 'Medium (~8MB stack per thread)',
      bestFor: 'Legacy I/O libraries, non-async socket APIs',
      timeline: [
        { label: 'Thread 1 (I/O wait yields GIL)', color: 'bg-cyan-500', width: '35%' },
        { label: 'Thread 2 (Runs while T1 waits)', color: 'bg-amber-500', width: '35%' },
        { label: 'Thread 3 (Runs concurrently)', color: 'bg-emerald-500', width: '30%' }
      ],
      totalTime: '2.1s (I/O overlaps, but thread context switch overhead)'
    },
    multiprocessing: {
      name: 'Multiprocessing (multiprocessing)',
      desc: 'Completely separate Python processes with independent GILs and memory spaces. Utilizes multiple CPU physical cores.',
      gil: 'Bypasses GIL entirely (Separate process per core)',
      memory: 'High (Process cloning & IPC overhead)',
      bestFor: 'CPU-bound operations (ML training, image processing, cryptography)',
      timeline: [
        { label: 'Core 1: Process 1 (100% CPU)', color: 'bg-purple-500', width: '33%' },
        { label: 'Core 2: Process 2 (100% CPU)', color: 'bg-purple-500', width: '33%' },
        { label: 'Core 3: Process 3 (100% CPU)', color: 'bg-purple-500', width: '33%' }
      ],
      totalTime: '2.0s (True hardware parallelism on multi-core CPU)'
    },
    asyncio: {
      name: 'Asyncio (Cooperative Coroutines)',
      desc: 'Single thread, single process, event loop. Non-blocking asynchronous I/O multiplexing via epoll/kqueue.',
      gil: 'Single GIL thread (No thread locking overhead)',
      memory: 'Ultra Low (~2KB per coroutine vs 8MB per thread)',
      bestFor: 'High-concurrency web servers, microservices, 10,000+ I/O connections',
      timeline: [
        { label: 'Coroutine 1, 2 & 3 await together on Event Loop', color: 'bg-cyan-400', width: '100%' }
      ],
      totalTime: '2.02s (Massive concurrency, lowest memory footprint)'
    }
  };

  const current = modelData[model];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h4 className="text-base font-bold text-white">Concurrency Architectures Comparison</h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare Sequential vs Threading vs Multiprocessing vs Asyncio execution models.
          </p>
        </div>
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['sync', 'threading', 'multiprocessing', 'asyncio'] as const).map(m => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition capitalize ${model === m ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Model Execution Timeline */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-white">{current.name}</span>
            <span className="text-xs font-mono font-bold text-cyan-400">Total Duration: {current.totalTime}</span>
          </div>

          <p className="text-xs text-slate-300">
            {current.desc}
          </p>

          {/* Timeline visualization */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-mono text-slate-400 font-bold flex justify-between">
              <span>Execution Timeline (Time Axis)</span>
              <span>0s -----------------------------&gt; Duration</span>
            </div>
            <div className="h-10 rounded-xl bg-slate-900 border border-slate-800 flex overflow-hidden p-1 gap-1">
              {current.timeline.map((item, idx) => (
                <div
                  key={idx}
                  style={{ width: item.width }}
                  className={`h-full rounded-lg ${item.color} flex items-center justify-center text-[10px] font-mono text-slate-950 font-bold px-2 truncate`}
                  title={item.label}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-500 font-mono text-[10px] block uppercase font-bold">GIL Impact:</span>
              <span className="text-slate-300 font-mono">{current.gil}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-500 font-mono text-[10px] block uppercase font-bold">Memory Footprint:</span>
              <span className="text-slate-300 font-mono">{current.memory}</span>
            </div>
          </div>
        </div>

        {/* Best Use-case Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-2">
              Optimal Workload Recommendation
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-1.5">
              <span className="text-xs font-bold text-cyan-400 block">Best Use Case:</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {current.bestFor}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300">Rule of Thumb:</div>
            <div>• CPU-Bound: <span className="text-purple-300 font-mono">multiprocessing</span></div>
            <div>• High I/O Bound: <span className="text-cyan-300 font-mono">asyncio</span></div>
            <div>• Legacy I/O Blocking: <span className="text-amber-300 font-mono">threading</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

