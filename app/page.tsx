"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as faceapi from "face-api.js";

declare global {
  interface Window {
    loadPyodide?: (opts?: { indexURL?: string }) => Promise<any>;
    pyodideInstance?: any;
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
    Tesseract?: any;
  }
}

type MenuKey =
  | "home"
  | "theory"
  | "flow"
  | "method"
  | "neuron"
  | "image"
  | "digit"
  | "sound"
  | "sensors"
  | "camera"
  | "aiTools"
  | "practice";

type ActivationName = "sigmoid" | "relu" | "tanh" | "linear";

type MethodTopic = {
  title: string;
  explain: string;
  formula: string;
  how: string;
  example: string;
  task1: string;
  task2: string;
  outputType: "graph" | "image" | "audio" | "table" | "camera" | "flow";
  graphTitle?: string;
  video?: string;
  code: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function relu(x: number) {
  return Math.max(0, x);
}

function tanhFn(x: number) {
  return Math.tanh(x);
}

function round(n: number, d = 3) {
  return Number(n.toFixed(d));
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function youtubeWatch(url: string) {
  if (!url) return url;
  if (url.includes("/embed/")) return url.replace("/embed/", "/watch?v=");
  return url;
}

function activate(x: number, name: ActivationName) {
  if (name === "sigmoid") return sigmoid(x);
  if (name === "relu") return relu(x);
  if (name === "tanh") return tanhFn(x);
  return x;
}

const methodTopics: MethodTopic[] = [
  {
    title: "1. Нейрондық желіні оқыту негіздері",
    explain:
      "Нейрондық желі кіріс деректерін өңдеп, салмақтар арқылы нәтиже шығарады. Бұл тақырыпта нейронның шығысы x өзгергенде қалай өзгеретінін графиктен көресіз.",
    formula: "z = wx + b,   y = sigmoid(z)",
    how: "Кіріс x салмақ w-пен көбейтіледі, bias b қосылады, содан кейін sigmoid функциясы қолданылады.",
    example: "x=2, w=0.5, b=1 → z=2, y=sigmoid(2)=0.881",
    task1: "w және b мәндерін өзгертіп, графиктің қалай өзгеретінін бақылаңыз.",
    task2: "x=-10...10 аралығында y мәндерін салыстырыңыз.",
    outputType: "graph",
    graphTitle: "Нейрон шығысы",
    video: "https://www.youtube.com/embed/aircAruvnKk",
    code: `import math

w = 1.2
b = -0.5

for x in range(-10, 11):
    y = 1 / (1 + math.exp(-(w * x + b)))
    x_values.append(x)
    y_values.append(y)
    print("x =", x, "y =", round(y, 4))`,
  },
  {
    title: "2. Перцептронның салмақталған қосындысын есептеу",
    explain:
      "Перцептронның негізгі қадамы — кіріс мәндерін салмақтап қосу. Бұл есеп нейронның бірінші ішкі есебін түсіндіреді.",
    formula: "z = w₁x₁ + w₂x₂ + b",
    how: "Әр кіріс өз салмағына көбейтіледі. Соңында bias қосылады.",
    example: "x1=0.7, x2=0.4, w1=0.6, w2=0.5, b=0.1 → z=0.72",
    task1: "x1 мен x2-ні ауыстырып көріңіз.",
    task2: "w1, w2, b мәндерін өзгертіп, z нәтижесін салыстырыңыз.",
    outputType: "table",
    video: "https://www.youtube.com/embed/ntKn5TPHHAk",
    code: `x1 = 0.7
x2 = 0.4
w1 = 0.6
w2 = 0.5
b = 0.1

print("w1*x1 =", round(w1*x1, 4))
print("w2*x2 =", round(w2*x2, 4))
print("b =", b)
print("z =", round(w1*x1 + w2*x2 + b, 4))`,
  },
  {
    title: "3. Sigmoid және ReLU функцияларын салыстыру",
    explain:
      "Activation функциясы нейронның есептелген мәнін түсінікті шығысқа айналдырады. Sigmoid 0 мен 1 аралығын, ReLU оң мәндерді көрсетеді.",
    formula: "sigmoid(x)=1/(1+e^-x), ReLU(x)=max(0,x)",
    how: "Бірдей x мәндері үшін екі функцияның нәтижесі салыстырылады.",
    example: "x=-3 → sigmoid≈0.047, ReLU=0",
    task1: "x ауқымын өзгертіңіз.",
    task2: "Қай функция қай есепке тиімді екенін түсіндіріңіз.",
    outputType: "graph",
    graphTitle: "Sigmoid графигі",
    video: "https://www.youtube.com/embed/cVTppf0l9LA",
    code: `import math

for x in range(-10, 11):
    sig = 1 / (1 + math.exp(-x))
    x_values.append(x)
    y_values.append(sig)
    print("x =", x, "sigmoid =", round(sig, 4), "relu =", max(0, x))`,
  },
  {
    title: "4. MSE қате функциясын есептеу",
    explain:
      "MSE — модельдің орташа квадрат қатесі. Қате аз болса, модель болжамы нақты мәнге жақындайды.",
    formula: "MSE = (1/n) Σ(y_true - y_pred)²",
    how: "Нақты және болжам мәндерінің айырмасы квадратталып, орташа мәні алынады.",
    example: "y_true=[1,0,1], y_pred=[0.8,0.2,0.6]",
    task1: "Болжамды өзгертіп көріңіз.",
    task2: "Өз мысалыңызды енгізіп тексеріңіз.",
    outputType: "graph",
    graphTitle: "Квадрат қателер",
    video: "https://www.youtube.com/embed/IHZwWFHWa-w",
    code: `y_true = [1, 0, 1]
y_pred = [0.8, 0.2, 0.6]

errors = []
for a, b in zip(y_true, y_pred):
    e = (a - b) ** 2
    errors.append(e)

for i, e in enumerate(errors, start=1):
    x_values.append(i)
    y_values.append(e)
    print("error", i, "=", round(e, 4))

print("MSE =", round(sum(errors)/len(errors), 4))`,
  },
  {
    title: "5. Градиенттік түсудің бір қадамы",
    explain:
      "Градиенттік түсу қателікті азайту үшін салмақтарды біртіндеп жаңартады.",
    formula: "w_new = w - lr·grad",
    how: "Градиент есептеледі, learning rate арқылы салмақ жаңарады.",
    example: "w=0.5, lr=0.1",
    task1: "Learning rate-ті 0.01 және 0.5 етіп салыстырыңыз.",
    task2: "10 қадамдық жаңартуды орындаңыз.",
    outputType: "graph",
    graphTitle: "Салмақтың өзгеруі",
    video: "https://www.youtube.com/embed/sDv4f4s2SB8",
    code: `x = 1
y = 2
w = 0.5
lr = 0.1

for step in range(1, 11):
    grad = -2 * x * (y - w * x)
    w = w - lr * grad
    x_values.append(step)
    y_values.append(w)
    print("step =", step, "w =", round(w, 4))`,
  },
  {
    title: "6. Бір жасырын қабатты желі құру",
    explain:
      "Жасырын қабат кіріс белгілерін өңдеп, шығысқа пайдалы ақпарат береді. Бұл көпқабатты желінің қарапайым логикасы.",
    formula: "Hidden = f(Wx+b), Output = f(Wh+b)",
    how: "Кіріс мәндері жасырын қабатқа өтеді, кейін шығыс есептеледі.",
    example: "2 кіріс, 2 жасырын нейрон, 1 шығыс",
    task1: "Bias мәнін өзгертіңіз.",
    task2: "Жасырын нейрон санын көбейтудің мәнін түсіндіріңіз.",
    outputType: "flow",
    video: "https://www.youtube.com/embed/CqOfi41LfDw",
    code: `inputs = [0.5, 0.8]

hidden_weights = [
    [0.2, 0.4],
    [0.7, 0.3]
]
hidden_bias = [0.1, -0.2]

hidden_outputs = []

for i in range(2):
    z = inputs[0]*hidden_weights[i][0] + inputs[1]*hidden_weights[i][1] + hidden_bias[i]
    h = max(0, z)
    hidden_outputs.append(h)
    print("Жасырын нейрон", i+1, "шығысы =", round(h, 4))

output_weights = [0.6, 0.9]
output_bias = 0.05
z_out = hidden_outputs[0]*output_weights[0] + hidden_outputs[1]*output_weights[1] + output_bias
print("Шығыс =", round(z_out, 4))`,
  },
  {
    title: "7. Суретті сұр түске ауыстыру",
    explain:
      "Суретті сұр түске айналдыру — image processing-тегі негізгі қадамдардың бірі. Бұл суреттегі жарықтықты талдауға көмектеседі.",
    formula: "Gray = 0.299R + 0.587G + 0.114B",
    how: "Әр пиксельдің RGB мәндері бір gray мәніне айналады.",
    example: "R=120, G=180, B=70",
    task1: "RGB мәндерін өзгертіңіз.",
    task2: "Gray мәннің қалай өзгеретінін бақылаңыз.",
    outputType: "image",
    video: "https://www.youtube.com/embed/8krd5qKVw-Q",
    code: `R = 120
G = 180
B = 70

gray = 0.299*R + 0.587*G + 0.114*B
print("Gray =", round(gray, 2))`,
  },
  {
    title: "8. Қателер матрицасын құру",
    explain:
      "Confusion Matrix модельдің дұрыс және қате жауаптарының санын көрсетеді.",
    formula: "[[TP, FP],[FN, TN]]",
    how: "Нақты жауаптар мен модель болжамдары салыстырылады.",
    example: "[[8,2],[1,9]]",
    task1: "Матрица мәндерін өзгертіңіз.",
    task2: "Қай ұяшықтардың көп болғаны жақсы екенін түсіндіріңіз.",
    outputType: "table",
    video: "https://www.youtube.com/embed/Kdsp6soqA7o",
    code: `cm = [
    [8, 2],
    [1, 9]
]

correct = cm[0][0] + cm[1][1]
total = sum(sum(row) for row in cm)
accuracy = correct / total

for row in cm:
    print(row)
print("Дәлдік =", round(accuracy, 3))`,
  },
  {
    title: "9. Дыбысты талдау",
    explain:
      "Дыбыс нейрондық желіге бірден мәтін болып кірмейді. Алдымен толқын, жиілік, амплитуда сияқты белгілерге бөлінеді.",
    formula: "Audio → Wave → Features → Result",
    how: "Жиілік пен амплитуда дыбыстың негізгі белгілері ретінде қаралады.",
    example: "Қатты дыбыс → жоғары амплитуда",
    task1: "Жиілігі жоғары дыбысқа мысал келтіріңіз.",
    task2: "Амплитуда неге әсер ететінін түсіндіріңіз.",
    outputType: "audio",
    video: "https://www.youtube.com/embed/LFXXTgc85ew",
    code: `samples = [0, 2, 5, 9, 5, 2, 0, -2, -5, -9, -5, -2, 0]

for i, amp in enumerate(samples):
    x_values.append(i)
    y_values.append(amp)
    print("sample", i, "amplitude =", amp)`,
  },
];

function usePyodideLoader() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (window.pyodideInstance) {
        if (mounted) setIsLoaded(true);
        return;
      }

      if (!window.loadPyodide) {
        const existing = document.querySelector('script[data-pyodide="true"]') as HTMLScriptElement | null;
        if (!existing) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";
          script.async = true;
          script.dataset.pyodide = "true";
          document.body.appendChild(script);

          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Pyodide script жүктелмеді"));
          });
        } else {
          await new Promise<void>((resolve) => {
            if ((window as any).loadPyodide) resolve();
            else existing.addEventListener("load", () => resolve(), { once: true });
          });
        }
      }

      if (!window.pyodideInstance && window.loadPyodide) {
        window.pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/",
        });
      }

      if (mounted) setIsLoaded(true);
    };

    load().catch(() => {
      if (mounted) setIsLoaded(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return isLoaded;
}

function SectionCard({
  title,
  children,
  accent = "from-blue-500 to-cyan-500",
}: {
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className={classNames("bg-gradient-to-r px-6 py-4 text-white", accent)}>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SmallInfo({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 text-base font-bold text-slate-900">{title}</div>
      <div className="text-sm leading-6 text-slate-700">{text}</div>
    </div>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-green-300">
      {children}
    </div>
  );
}

function DiagramVisual({
  kind,
  title,
}: {
  kind: string;
  title: string;
}) {
  const map: Record<string, { emoji: string; steps: string[]; colors: string[] }> = {
    neuron: {
      emoji: "🧠",
      steps: ["Кіріс", "Салмақ", "Bias", "Activation", "Нәтиже"],
      colors: ["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#2563eb"],
    },
    flow: {
      emoji: "⚡",
      steps: ["Дерек", "Белгі", "Қабат", "Нейрон", "Шешім"],
      colors: ["#ccfbf1", "#99f6e4", "#5eead4", "#2dd4bf", "#0f766e"],
    },
    image: {
      emoji: "🖼️",
      steps: ["Сурет", "Пиксель", "Белгі", "Модель", "Класс"],
      colors: ["#fce7f3", "#fbcfe8", "#f9a8d4", "#ec4899", "#be185d"],
    },
    digit: {
      emoji: "🔢",
      steps: ["Жазу", "28×28", "Сызық", "Модель", "Цифр"],
      colors: ["#ede9fe", "#ddd6fe", "#c4b5fd", "#8b5cf6", "#6d28d9"],
    },
    sound: {
      emoji: "🎤",
      steps: ["Дыбыс", "Толқын", "Жиілік", "Нейрон", "Нәтиже"],
      colors: ["#f3e8ff", "#e9d5ff", "#d8b4fe", "#a855f7", "#7e22ce"],
    },
    weather: {
      emoji: "🌦️",
      steps: ["Темп.", "Ылғал", "Жел", "Қысым", "Болжам"],
      colors: ["#dcfce7", "#bbf7d0", "#86efac", "#22c55e", "#15803d"],
    },
    health: {
      emoji: "❤️",
      steps: ["Қызу", "Пульс", "Қысым", "Глюкоза", "Қауіп"],
      colors: ["#ffe4e6", "#fecdd3", "#fda4af", "#fb7185", "#be123c"],
    },
    camera: {
      emoji: "🚶‍♂️",
      steps: ["Камера", "Кадр", "Ер адам", "Аймақ", "Тоқтау"],
      colors: ["#e2e8f0", "#cbd5e1", "#94a3b8", "#ef4444", "#991b1b"],
    },
    apps: {
      emoji: "🤖",
      steps: ["Медицина", "Камера", "Дыбыс", "Өндіріс", "Білім"],
      colors: ["#f1f5f9", "#cbd5e1", "#94a3b8", "#64748b", "#334155"],
    },
  };

  const item = map[kind] || map.flow;

  return (
    <div className="relative h-[310px] overflow-hidden rounded-t-3xl bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="absolute right-8 top-8 flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl shadow">
        {item.emoji}
      </div>
      <div className="absolute left-6 top-6 max-w-[70%] text-2xl font-black text-slate-900">
        {title}
      </div>

      <svg viewBox="0 0 900 260" className="absolute bottom-0 left-0 h-[230px] w-full">
        {item.steps.map((step, i) => {
          const x = 55 + i * 165;
          const y = 90 + (i % 2) * 28;
          return (
            <g key={step}>
              <rect x={x} y={y} width="125" height="70" rx="20" fill="white" stroke={item.colors[i]} strokeWidth="5" />
              <text x={x + 62} y={y + 42} textAnchor="middle" fontFamily="Arial" fontSize="20" fontWeight="800" fill="#0f172a">
                {step}
              </text>
              <circle cx={x + 62} cy={y + 58} r="8" fill={item.colors[i]}>
                <animate attributeName="opacity" values="0.25;1;0.25" dur="1.4s" repeatCount="indefinite" begin={`${i * 0.18}s`} />
              </circle>
              {i < item.steps.length - 1 && (
                <>
                  <path d={`M ${x + 130} ${y + 35} C ${x + 150} ${y + 35}, ${x + 140} ${90 + ((i + 1) % 2) * 28 + 35}, ${x + 160} ${90 + ((i + 1) % 2) * 28 + 35}`} stroke="#334155" strokeWidth="5" fill="none" strokeLinecap="round" />
                  <circle r="7" fill="#facc15">
                    <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${i * 0.2}s`} path={`M ${x + 130} ${y + 35} C ${x + 150} ${y + 35}, ${x + 140} ${90 + ((i + 1) % 2) * 28 + 35}, ${x + 160} ${90 + ((i + 1) % 2) * 28 + 35}`} />
                  </circle>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function getVisualKind(src: string, title: string) {
  const s = `${src} ${title}`.toLowerCase();
  if (s.includes("neuron") || s.includes("нейрон")) return "neuron";
  if (s.includes("image") || s.includes("сурет")) return "image";
  if (s.includes("digit") || s.includes("цифр")) return "digit";
  if (s.includes("sound") || s.includes("дыбыс")) return "sound";
  if (s.includes("weather") || s.includes("ауа")) return "weather";
  if (s.includes("health") || s.includes("денсаулық")) return "health";
  if (s.includes("camera") || s.includes("pedestrian") || s.includes("камера") || s.includes("жаяу")) return "camera";
  if (s.includes("applications") || s.includes("қолданылады")) return "apps";
  return "flow";
}

function VisualImage({
  src,
  title,
  text,
}: {
  src: string;
  title: string;
  text: string;
}) {
  const kind = getVisualKind(src, title);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {!imgError ? (
        <img
          src={src}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full border-b border-slate-200 bg-slate-50"
        />
      ) : (
        <DiagramVisual kind={kind} title={title} />
      )}

      <div className="p-4">
        <div className="mb-1 text-lg font-bold text-slate-900">{title}</div>
        <div className="text-sm leading-6 text-slate-700">{text}</div>
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-mono text-slate-900">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function Navbar({
  current,
  onChange,
}: {
  current: MenuKey;
  onChange: (k: MenuKey) => void;
}) {
  const items: Array<{ key: MenuKey; label: string }> = [
    { key: "home", label: "Басты бет" },
    { key: "theory", label: "Теория" },
    { key: "flow", label: "Ақпарат ағыны" },
    { key: "method", label: "Әдістеме" },
    { key: "neuron", label: "Нейрон" },
    { key: "image", label: "Сурет" },
    { key: "digit", label: "Цифр тану" },
    { key: "sound", label: "Дыбыс" },
    { key: "sensors", label: "Ауа райы / Денсаулық" },
    { key: "camera", label: "Камера" },
    { key: "aiTools", label: "AI құралдар" },
    { key: "practice", label: "Практика" },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={
              current === item.key
                ? "rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition"
                : "rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InlineLineChart({
  xValues,
  yValues,
  title = "График",
}: {
  xValues: number[];
  yValues: number[];
  title?: string;
}) {
  if (!xValues.length || !yValues.length || xValues.length !== yValues.length) return null;

  const width = 760;
  const height = 320;
  const pad = 50;
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  const mapX = (x: number) =>
    maxX === minX ? width / 2 : ((x - minX) / (maxX - minX)) * (width - pad * 2) + pad;

  const mapY = (y: number) =>
    maxY === minY
      ? height / 2
      : height - (((y - minY) / (maxY - minY)) * (height - pad * 2) + pad);

  const path = xValues
    .map((x, i) => `${i === 0 ? "M" : "L"} ${mapX(x)} ${mapY(yValues[i])}`)
    .join(" ");

  return (
    <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
      <div className="font-semibold text-slate-800">{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-2xl border border-slate-200 bg-white">
        <rect x="0" y="0" width={width} height={height} fill="white" />
        {[...Array(6)].map((_, i) => {
          const y = pad + ((height - pad * 2) / 5) * i;
          return <line key={`gy-${i}`} x1={pad} y1={y} x2={width - pad} y2={y} stroke="#e2e8f0" />;
        })}
        {[...Array(7)].map((_, i) => {
          const x = pad + ((width - pad * 2) / 6) * i;
          return <line key={`gx-${i}`} x1={x} y1={pad} x2={x} y2={height - pad} stroke="#e2e8f0" />;
        })}
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#334155" strokeWidth="2" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#334155" strokeWidth="2" />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="4" />
        {xValues.map((x, i) => (
          <circle key={i} cx={mapX(x)} cy={mapY(yValues[i])} r="4" fill="#2563eb" />
        ))}
      </svg>
    </div>
  );
}

function BarChart({
  title,
  data,
  suffix = "%",
}: {
  title: string;
  data: Array<{ label: string; value: number }>;
  suffix?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
      <div className="font-bold text-slate-900">{title}</div>
      {data.map((d) => (
        <div key={d.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700">{d.label}</span>
            <span className="font-mono text-slate-900">
              {round(d.value, 1)}
              {suffix}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}



function PythonRunner({
  defaultCode,
  title = "Python кодын орындау",
  graphTitle = "Нәтиже графигі",
}: {
  defaultCode: string;
  title?: string;
  graphTitle?: string;
}) {
  const pyodideReady = usePyodideLoader();
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState("Нәтиже осында шығады...");
  const [loading, setLoading] = useState(false);
  const [xValues, setXValues] = useState<number[]>([]);
  const [yValues, setYValues] = useState<number[]>([]);

  const runPython = async () => {
    try {
      setLoading(true);
      setOutput("Python жүктелуде...");
      setXValues([]);
      setYValues([]);

      if (!pyodideReady || !window.pyodideInstance) {
        setOutput("Pyodide әлі жүктелмеді. Бірнеше секунд күтіп, қайта басыңыз.");
        return;
      }

      const pyodide = window.pyodideInstance;
      const wrappedCode = `
import sys
from io import StringIO
_stdout = sys.stdout
sys.stdout = StringIO()
x_values = []
y_values = []

try:
${code
  .split("\n")
  .map((line) => "    " + line)
  .join("\n")}
except Exception as e:
    print("Қате:", e)

output = sys.stdout.getvalue()
sys.stdout = _stdout
output
      `;

      const result = await pyodide.runPythonAsync(wrappedCode);
      setOutput(String(result || "Код орындалды"));

      try {
        const xs = pyodide.globals.get("x_values");
        const ys = pyodide.globals.get("y_values");
        const jsXs = xs.toJs ? xs.toJs() : [];
        const jsYs = ys.toJs ? ys.toJs() : [];
        if (Array.isArray(jsXs) && Array.isArray(jsYs) && jsXs.length && jsYs.length) {
          setXValues(jsXs.map(Number));
          setYValues(jsYs.map(Number));
        }
      } catch {
        setXValues([]);
        setYValues([]);
      }
    } catch (err: any) {
      setOutput(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="font-bold text-slate-800">{title}</div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="h-56 w-full rounded-xl border border-slate-300 p-3 font-mono text-sm"
      />
      <button onClick={runPython} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">
        ▶ Кодты орындау
      </button>
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-sm text-green-400 whitespace-pre-wrap">
        {loading ? "Python іске қосылуда..." : output}
      </pre>
      {xValues.length > 0 && yValues.length > 0 && (
        <InlineLineChart xValues={xValues} yValues={yValues} title={graphTitle} />
      )}
    </div>
  );
}


function AnimatedFlow({
  steps,
}: {
  steps: string[];
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5">
      <div className="relative flex flex-wrap items-center justify-center gap-4 py-4">
        {steps.map((step, index) => (
          <div key={`${step}-${index}`} className="flex items-center gap-4">
            <div className="relative rounded-2xl border border-blue-200 bg-white px-5 py-4 text-center shadow-sm">
              <div className="text-sm font-bold text-slate-900">{step}</div>
              <div
                className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-blue-600"
                style={{
                  animation: "flowPulse 1.8s infinite",
                  animationDelay: `${index * 0.18}s`,
                }}
              />
            </div>
            {index < steps.length - 1 && (
              <div className="text-2xl font-black text-blue-500">→</div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes flowPulse {
          0%,
          100% {
            transform: translateX(-50%) scale(0.7);
            opacity: 0.35;
          }
          50% {
            transform: translateX(-50%) scale(1.25);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

function AnimatedSignalChart({
  title = "Анимациялық ақпарат графигі",
  label = "Нейрон сигналы",
}: {
  title?: string;
  label?: string;
}) {
  const xs = Array.from({ length: 40 }, (_, i) => i);
  const width = 760;
  const height = 260;
  const pad = 35;
  const path = xs
    .map((x, i) => {
      const px = pad + (x / 39) * (width - pad * 2);
      const py = height / 2 + Math.sin(i / 2.2) * 52 + Math.cos(i / 4) * 18;
      return `${i === 0 ? "M" : "L"} ${px} ${py}`;
    })
    .join(" ");

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4">
      <div className="mb-3 font-bold text-slate-900">{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-2xl bg-slate-950">
        <defs>
          <linearGradient id="signalGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        {[...Array(6)].map((_, i) => (
          <line key={`g-${i}`} x1="30" x2={width - 30} y1={30 + i * 40} y2={30 + i * 40} stroke="#1e293b" />
        ))}
        <path d={path} fill="none" stroke="url(#signalGrad)" strokeWidth="5" strokeLinecap="round" />
        <circle r="10" fill="#facc15">
          <animateMotion dur="3.2s" repeatCount="indefinite" path={path} />
        </circle>
        <text x="35" y="35" fill="#cbd5e1" fontSize="18" fontFamily="Arial" fontWeight="700">
          {label}
        </text>
      </svg>
      <div className="mt-3 text-sm leading-6 text-slate-700">
        Сары нүкте ақпараттың бір нейроннан екінші нейронға өтуін көрсетеді. Сигнал күшейсе — белгі маңызды, әлсіресе — белгі аз әсер етеді.
      </div>
    </div>
  );
}

function LiveCameraPreview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState("Камера әлі қосылмаған");
  const [captured, setCaptured] = useState(false);
  const [isGray, setIsGray] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("Камера қосылды. Енді кадрды суретке түсіріп немесе дайын сурет жүктеуге болады.");
    } catch {
      setStatus("Камераға рұқсат берілмеді. Браузердің адрес жолағынан камера рұқсатын қосыңыз.");
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = 640;
    canvas.height = 360;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCaptured(true);
    setIsGray(false);
    setStatus("Кадр суретке түсірілді. Енді оны сұр түске айналдыруға болады.");
  };

  const uploadImage = (file: File | undefined) => {
    if (!file) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = 640;
      canvas.height = 360;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);

      setCaptured(true);
      setIsGray(false);
      setStatus("Сурет жүктелді. Бұл суретті де нейрондық желі өңдей алатын кадр ретінде қарастыруға болады.");
    };
    img.src = URL.createObjectURL(file);
  };

  const makeGray = () => {
    const canvas = canvasRef.current;
    if (!canvas || !captured) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    ctx.putImageData(img, 0, 0);
    setIsGray(true);
    setStatus("Сурет сұр түске айналды. Бұл — image processing-тегі алдын ала өңдеу қадамы.");
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("Камера тоқтатылды.");
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
      <div>
        <div className="font-bold text-slate-900">Камерамен және дайын суретпен тәжірибе</div>
        <div className="text-sm leading-6 text-slate-600">
          Камера кадрын алуға немесе компьютерден сурет жүктеуге болады. Кейін суретті сұр түске айналдырып, өңдеу қадамын көресіз.
        </div>
      </div>

      <video ref={videoRef} className="aspect-video w-full rounded-2xl bg-slate-900 object-cover" playsInline muted />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => uploadImage(e.target.files?.[0])}
      />

      <div className="flex flex-wrap gap-2">
        <button onClick={startCamera} className="rounded-2xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800">📷 Камераны қосу</button>
        <button onClick={captureFrame} className="rounded-2xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">🖼 Суретке түсіру</button>
        <button onClick={() => fileInputRef.current?.click()} className="rounded-2xl bg-violet-600 px-4 py-2 font-bold text-white hover:bg-violet-700">⬆ Сурет жүктеу</button>
        <button onClick={makeGray} className="rounded-2xl bg-slate-600 px-4 py-2 font-bold text-white hover:bg-slate-700">⚫ Сұр түске айналдыру</button>
        <button onClick={stopCamera} className="rounded-2xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700">⏹ Тоқтату</button>
      </div>

      <canvas ref={canvasRef} className={captured ? "aspect-video w-full rounded-2xl border border-slate-200 bg-white object-cover" : "hidden"} />

      {captured && (
        <Formula>{`Кадр өңделді:
1) сурет алынды
2) пиксельдер оқылды
3) ${isGray ? "RGB → Gray түрлендіру орындалды" : "сұр түске айналдыру әлі орындалған жоқ"}
4) келесі қадам: объектіні анықтау`}</Formula>
      )}

      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{status}</div>
    </div>
  );
}
function NeuralNetworkAnimation() {
  const layers = [
    { name: "Кіріс қабаты", nodes: 4, x: 110 },
    { name: "Жасырын қабат 1", nodes: 5, x: 330 },
    { name: "Жасырын қабат 2", nodes: 4, x: 560 },
    { name: "Шығыс қабаты", nodes: 3, x: 780 },
  ];

  const nodePositions = layers.flatMap((layer) =>
    Array.from({ length: layer.nodes }, (_, i) => ({
      x: layer.x,
      y: 70 + i * (260 / Math.max(layer.nodes - 1, 1)),
      layer: layer.name,
    }))
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-xl font-black text-slate-900">Нейрондық желі қалай жұмыс жасайды?</div>
        <div className="text-sm leading-6 text-slate-600">
          Сары сигналдар ақпараттың қабаттар арасында қозғалуын көрсетеді: дерек кіреді, белгілер өңделеді, соңында нәтиже шығады.
        </div>
      </div>

      <svg viewBox="0 0 900 430" className="w-full rounded-3xl bg-slate-950">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {layers.map((layer) => (
          <text key={layer.name} x={layer.x} y="390" textAnchor="middle" fill="#cbd5e1" fontSize="18" fontFamily="Arial" fontWeight="700">
            {layer.name}
          </text>
        ))}

        {layers.slice(0, -1).map((layer, li) => {
          const next = layers[li + 1];
          const leftNodes = nodePositions.filter((n) => n.x === layer.x);
          const rightNodes = nodePositions.filter((n) => n.x === next.x);
          return leftNodes.flatMap((a, ai) =>
            rightNodes.map((b, bi) => (
              <line
                key={`${li}-${ai}-${bi}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#334155"
                strokeWidth="2"
                opacity="0.55"
              />
            ))
          );
        })}

        {nodePositions.map((n, i) => (
          <g key={`${n.x}-${n.y}`}>
            <circle cx={n.x} cy={n.y} r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="4" />
            <circle cx={n.x} cy={n.y} r="8" fill="#38bdf8">
              <animate attributeName="r" values="7;14;7" dur="2s" repeatCount="indefinite" begin={`${i * 0.08}s`} />
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" begin={`${i * 0.08}s`} />
            </circle>
          </g>
        ))}

        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} r="8" fill="#facc15" filter="url(#glow)">
            <animateMotion
              dur="3.2s"
              repeatCount="indefinite"
              begin={`${i * 0.45}s`}
              path={`M 110 ${85 + (i % 4) * 80} C 220 ${80 + (i % 5) * 55}, 260 ${90 + (i % 5) * 55}, 330 ${70 + (i % 5) * 65} C 430 ${90 + (i % 4) * 70}, 480 ${80 + (i % 4) * 70}, 560 ${70 + (i % 4) * 85} C 650 ${90 + (i % 3) * 90}, 700 ${100 + (i % 3) * 90}, 780 ${85 + (i % 3) * 115}`}
            />
          </circle>
        ))}

        <rect x="35" y="25" width="230" height="54" rx="18" fill="#1e293b" />
        <text x="150" y="58" textAnchor="middle" fill="white" fontSize="18" fontFamily="Arial" fontWeight="800">
          Кіріс дерек
        </text>

        <rect x="650" y="25" width="210" height="54" rx="18" fill="#166534" />
        <text x="755" y="58" textAnchor="middle" fill="white" fontSize="18" fontFamily="Arial" fontWeight="800">
          Нәтиже
        </text>
      </svg>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <SmallInfo title="1. Кіріс" text="Сурет, дыбыс, сан немесе датчик мәні модельге беріледі." />
        <SmallInfo title="2. Салмақ" text="Әр байланыс ақпараттың маңызын күшейтеді немесе әлсіретеді." />
        <SmallInfo title="3. Қабат" text="Жасырын қабаттар қарапайым белгілерді күрделі белгілерге айналдырады." />
        <SmallInfo title="4. Шешім" text="Шығыс қабаты ең ықтимал нәтижені таңдайды." />
      </div>
    </div>
  );
}


function ColorTransformDemo() {
  const [r, setR] = useState(120);
  const [g, setG] = useState(180);
  const [b, setB] = useState(70);
  const [mode, setMode] = useState<"original" | "gray" | "invert" | "bright">("original");

  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const color =
    mode === "gray"
      ? `rgb(${gray},${gray},${gray})`
      : mode === "invert"
      ? `rgb(${255 - r},${255 - g},${255 - b})`
      : mode === "bright"
      ? `rgb(${clamp(r + 45, 0, 255)},${clamp(g + 45, 0, 255)},${clamp(b + 45, 0, 255)})`
      : `rgb(${r},${g},${b})`;

  const label =
    mode === "gray"
      ? "Сұр түске айналдыру"
      : mode === "invert"
      ? "Түстерді кері ауыстыру"
      : mode === "bright"
      ? "Жарықтықты арттыру"
      : "Бастапқы түс";

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4">
      <div>
        <div className="text-lg font-black text-slate-900">Түсті түрлендіру симуляторы</div>
        <div className="text-sm leading-6 text-slate-600">
          RGB мәндерін өзгертіп, суреттің бастапқы түсін, сұр түске ауысуын, кері түске ауысуын және жарықтық өзгерісін көріңіз.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <RangeField label="R қызыл арнасы" value={r} min={0} max={255} step={1} onChange={setR} />
          <RangeField label="G жасыл арнасы" value={g} min={0} max={255} step={1} onChange={setG} />
          <RangeField label="B көк арнасы" value={b} min={0} max={255} step={1} onChange={setB} />

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setMode("original")} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-900">Бастапқы</button>
            <button onClick={() => setMode("gray")} className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold text-white">Сұр түс</button>
            <button onClick={() => setMode("invert")} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Кері ауыстыру</button>
            <button onClick={() => setMode("bright")} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white">Жарықтық</button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex h-48 items-center justify-center rounded-3xl border border-slate-200 text-xl font-black text-white shadow-inner" style={{ background: color }}>
            {label}
          </div>
          <Formula>{`RGB = (${r}, ${g}, ${b})
Gray = 0.299R + 0.587G + 0.114B = ${gray}
Ағымдағы режим: ${label}`}</Formula>
        </div>
      </div>
    </div>
  );
}

function TopicOutput({
  outputType,
  title,
}: {
  outputType: "graph" | "image" | "audio" | "table" | "camera" | "flow";
  title: string;
}) {
  if (outputType === "graph") {
    const xs: number[] = [];
    const ys: number[] = [];
    for (let x = -10; x <= 10; x += 1) {
      xs.push(x);
      ys.push(title.includes("MSE") ? Math.pow((x - 2) / 6, 2) : sigmoid(x));
    }
    return <InlineLineChart xValues={xs} yValues={ys} title={title.includes("MSE") ? "Қате мәнінің өзгеруі" : "Функция графигі"} />;
  }

  if (outputType === "image") {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <VisualImage
            src="/visuals/image-processing.svg"
            title="Сурет өңдеу жолы"
            text="Сурет пиксельдерге бөлініп, кейін қажетті белгілер анықталады."
          />
          <BarChart
            title="RGB → Gray үлесі"
            data={[
              { label: "R", value: 29.9 },
              { label: "G", value: 58.7 },
              { label: "B", value: 11.4 },
            ]}
          />
        </div>
        <ColorTransformDemo />
      </div>
    );
  }

  if (outputType === "audio") {
    const xs = Array.from({ length: 30 }, (_, i) => i);
    const ys = xs.map((x) => Math.sin(x / 2) * 8);
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <VisualImage
          src="/visuals/sound-ai.svg"
          title="Дыбыстың нейронға айналуы"
          text="Дыбыс толқыны жиілік, амплитуда сияқты белгілерге бөлінеді."
        />
        <InlineLineChart xValues={xs} yValues={ys} title="Дыбыс толқынының үлгісі" />
      </div>
    );
  }

  if (outputType === "flow") {
    return <AnimatedFlow steps={["x₁, x₂", "1-қабат", "2-қабат", "Шығыс", "Шешім"]} />;
  }

  if (outputType === "table") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 font-bold text-slate-800">Кестелік нәтиже</div>
        <div className="grid gap-4 lg:grid-cols-2">
          <table className="min-w-full border-collapse border border-slate-300 text-sm">
            <tbody>
              <tr>
                <td className="border px-3 py-2 font-bold">Дұрыс жауап</td>
                <td className="border px-3 py-2">17</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-bold">Қате жауап</td>
                <td className="border px-3 py-2">3</td>
              </tr>
              <tr>
                <td className="border px-3 py-2 font-bold">Дәлдік</td>
                <td className="border px-3 py-2">85%</td>
              </tr>
            </tbody>
          </table>
          <BarChart title="Матрица түсіндірмесі" data={[{ label: "Дұрыс", value: 85 }, { label: "Қате", value: 15 }]} />
        </div>
      </div>
    );
  }

  return null;
}

function HomePage({ onStart }: { onStart: (menu: MenuKey) => void }) {
  return (
    <div className="space-y-10">
      <section className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <div className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Жасанды интеллект • Машиналық оқыту • Нейрондық желі
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            Нейрондық желіні көріп, өзгертіп, түсінетін интерактивті зертхана
          </h1>

          <p className="text-lg leading-8 text-slate-700">
            Бұл платформада нейрондық желі құр мәтінмен емес, қозғалыс, график, тәжірибе және нақты нәтиже арқылы түсіндіріледі.
            Оқушы дерек қалай кіретінін, салмақтардың қалай әсер ететінін, activation функциясының нәтижені қалай өзгертетінін
            және модельдің неге дәл сол шешімді таңдағанын көзбен көреді.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <SmallInfo title="1. Кіріс" text="Сурет, дыбыс, сан, ауа райы немесе денсаулық дерегі беріледі." />
            <SmallInfo title="2. Өңдеу" text="Нейрон салмақ, bias және activation арқылы ақпаратты түрлендіреді." />
            <SmallInfo title="3. Шешім" text="Модель нәтиже шығарып, неге солай шешкенін түсіндіреді." />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onStart("flow")}
              className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Ақпарат ағынын көру
            </button>
            <button
              onClick={() => onStart("digit")}
              className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Цифр танып көру
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 text-white">
            <h2 className="text-2xl font-bold">Таныстыру видеосы</h2>
          </div>
          <div className="p-4">
            <video
              className="w-full rounded-3xl border border-slate-200 bg-black"
              controls
              playsInline
              preload="metadata"
            >
              <source src="/welcome-video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <SectionCard title="Нейрондық желіні түсіну картасы" accent="from-indigo-600 to-blue-600">
        <div className="grid gap-4 lg:grid-cols-2">
          <VisualImage
            src="/visuals/neural-flow.svg"
            title="Ақпарат қалай жүреді?"
            text="Дерек кіріс қабатынан жасырын қабаттарға өтіп, соңында шешімге айналады."
          />
          <VisualImage
            src="/visuals/applications-ai.svg"
            title="Қайда қолданылады?"
            text="Нейрондық желілер медицинада, камерада, дыбыста, өндірісте және білім беруде қолданылады."
          />
        </div>
      </SectionCard>
    </div>
  );
}

function TheoryPage() {
  return (
    <div className="space-y-6">
      <SectionCard title="Теориялық негіздер" accent="from-blue-600 to-indigo-600">
        <div className="grid gap-4 lg:grid-cols-2">
          <VisualImage
            src="/visuals/neuron-structure.svg"
            title="Жасанды нейрон"
            text="Нейрон кіріс мәндерді қабылдайды, оларды салмақтармен көбейтеді, bias қосады және activation арқылы нәтиже шығарады."
          />
          <VisualImage
            src="/visuals/neural-flow.svg"
            title="Қабаттар арқылы өңдеу"
            text="Нейрондық желі бірнеше қабаттан тұрады: кіріс қабаты, жасырын қабат және шығыс қабаты."
          />
        </div>
      </SectionCard>

      <NeuralNetworkAnimation />

      

      <SectionCard title="Нейрондық желінің ақпаратты өңдеу кезеңдері" accent="from-purple-600 to-indigo-600">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <AnimatedFlow steps={["Дерек", "Нормализация", "Салмақ", "Қабат", "Нәтиже"]} />
            <SmallInfo
              title="Қарапайым түсіндіру"
              text="Нейрондық желі ақпаратты бір жерден екінші жерге жай ғана көшірмейді. Ол ақпаратты әр қабатта өңдейді: белгілерді бөледі, маңыздысын күшейтеді, қажетсізін әлсіретеді."
            />
          </div>
          <div className="space-y-4">
            <AnimatedSignalChart title="Ақпарат сигналының қабаттар арқылы өтуі" label="input → hidden → output" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Негізгі формула" accent="from-orange-500 to-rose-500">
        <Formula>{`z = w₁x₁ + w₂x₂ + ... + wₙxₙ + b
y = f(z)

Мұнда:
x — кіріс мәндер
w — салмақтар
b — bias
z — салмақталған қосынды
f — activation функциясы
y — шығыс нәтиже`}</Formula>
      </SectionCard>

      <SectionCard title="Негізгі ұғымдар" accent="from-cyan-600 to-sky-600">
        <div className="grid gap-4 md:grid-cols-4">
          <SmallInfo title="Кіріс" text="Модельге берілетін бастапқы дерек: сурет, сан, дыбыс, температура." />
          <SmallInfo title="Салмақ" text="Әр белгінің қаншалық маңызды екенін көрсететін коэффициент." />
          <SmallInfo title="Bias" text="Нейрон шешімінің шекарасын ығыстыратын қосымша мән." />
          <SmallInfo title="Activation" text="Нейрон нәтижесін белгілі аралыққа келтіретін функция." />
        </div>
      </SectionCard>

      <SectionCard title="Видео сабақ" accent="from-rose-600 to-orange-500">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <div className="mb-2 font-bold text-rose-900">Нейрондық желі туралы қосымша видео</div>
          <p className="mb-3 text-sm text-slate-700">
            Видео сайтқа толық енгізілмейді, авторлық құқықты сақтау үшін тек сілтеме беріледі.
          </p>
          <a
            href="https://www.youtube.com/watch?v=aircAruvnKk"
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Видео сабаққа өту
          </a>
        </div>
      </SectionCard>
    </div>
  );
}




function PlaygroundLikeSimulator() {
  const [dataset, setDataset] = useState<"circle" | "spiral" | "xor" | "clusters">("circle");
  const [activation, setActivation] = useState<"tanh" | "sigmoid" | "relu">("tanh");
  const [learningRate, setLearningRate] = useState(0.03);
  const [regularization, setRegularization] = useState<"none" | "L2">("L2");
  const [regularizationRate, setRegularizationRate] = useState(0.003);
  const [hiddenLayers, setHiddenLayers] = useState(2);
  const [neurons, setNeurons] = useState(8);
  const [noise, setNoise] = useState(5);
  const [batchSize, setBatchSize] = useState(12);
  const [trainRatio, setTrainRatio] = useState(40);
  const [epoch, setEpoch] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [controlVersion, setControlVersion] = useState(0);
  const bumpControls = () => setControlVersion((v) => v + 1);
  const [showTest, setShowTest] = useState(false);
  const [discretize, setDiscretize] = useState(false);
  const [features, setFeatures] = useState({
    x: true,
    y: true,
    x2: true,
    y2: true,
    xy: true,
    sinX: true,
    sinY: true,
    cosX: false,
    cosY: false,
  });

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => setEpoch((e) => Math.min(e + 7, 999999)), 120);
    return () => clearInterval(timer);
  }, [isRunning]);

  const activateLocal = (v: number) => {
    if (activation === "sigmoid") return 1 / (1 + Math.exp(-v));
    if (activation === "relu") return Math.max(0, v);
    return Math.tanh(v);
  };

  const getLabel = (x: number, y: number): 0 | 1 => {
    if (dataset === "circle") return Math.sqrt(x * x + y * y) < 0.48 ? 1 : 0;
    if (dataset === "xor") return x * y > 0 ? 1 : 0;
    if (dataset === "clusters") return (x + 0.15) * 0.85 + y * 0.55 + Math.sin(x * 4) * 0.18 > 0 ? 1 : 0;

    const angle = Math.atan2(y, x);
    const radius = Math.sqrt(x * x + y * y);
    return Math.sin(angle * 2.2 + radius * 7) > 0 ? 1 : 0;
  };

  const data = useMemo(() => {
    const points: Array<{ x: number; y: number; label: 0 | 1; test: boolean }> = [];
    for (let i = 0; i < 160; i++) {
      let x = Math.random() * 2 - 1;
      let y = Math.random() * 2 - 1;
      x = clamp(x + (Math.random() - 0.5) * (noise / 90), -1, 1);
      y = clamp(y + (Math.random() - 0.5) * (noise / 90), -1, 1);
      points.push({ x, y, label: getLabel(x, y), test: i > (trainRatio / 100) * 160 });
    }
    return points;
  }, [dataset, noise, trainRatio]);

  const predict = (x: number, y: number) => {
    let z = 0;
    const complexity = hiddenLayers * 0.52 + neurons * 0.08 + epoch * learningRate * 0.45 + controlVersion * 0.035;
    const featureShift = Math.sin(controlVersion * 0.7) * 0.16;

    if (dataset === "circle") z = 0.48 - Math.sqrt((x + featureShift) * (x + featureShift) + (y - featureShift) * (y - featureShift));
    if (dataset === "xor") z = (x + featureShift) * (y - featureShift);
    if (dataset === "clusters") z = (x + 0.15 + featureShift) * 0.85 + (y - featureShift) * 0.55 + Math.sin((x + featureShift) * 4) * 0.18;
    if (dataset === "spiral") {
      const angle = Math.atan2(y - featureShift, x + featureShift);
      const radius = Math.sqrt((x + featureShift) * (x + featureShift) + (y - featureShift) * (y - featureShift));
      z = Math.sin(angle * 2.2 + radius * 7);
    }

    const featureBoost =
      (features.x ? 0.34 * (x + featureShift) : 0) +
      (features.y ? 0.34 * (y - featureShift) : 0) +
      (features.x2 ? 0.46 * (x * x - 0.35) : 0) -
      (features.y2 ? 0.42 * (y * y - 0.35) : 0) +
      (features.xy ? 0.62 * x * y : 0) +
      (features.sinX ? 0.34 * Math.sin(x * 4) : 0) +
      (features.sinY ? 0.34 * Math.sin(y * 4) : 0) +
      (features.cosX ? 0.28 * Math.cos(x * 5) : 0) +
      (features.cosY ? 0.28 * Math.cos(y * 5) : 0);

    const regPenalty = regularization === "L2" ? 1 - regularizationRate * 8 : 1;
    return activateLocal((z + featureBoost) * complexity * regPenalty * 3);
  };

  const grid = useMemo(() => {
    const cells: Array<{ x: number; y: number; v: number }> = [];
    for (let gy = 0; gy < 46; gy++) {
      for (let gx = 0; gx < 46; gx++) {
        const x = -1 + (gx / 45) * 2;
        const y = -1 + (gy / 45) * 2;
        cells.push({ x: gx, y: gy, v: predict(x, y) });
      }
    }
    return cells;
  }, [dataset, activation, hiddenLayers, neurons, epoch, features, regularization, regularizationRate, learningRate, noise, batchSize, trainRatio, controlVersion]);

  const accuracy = useMemo(() => {
    let correct = 0;
    data.forEach((p) => {
      const pred = predict(p.x, p.y) > 0 ? 1 : 0;
      if (pred === p.label) correct++;
    });
    return Math.round((correct / data.length) * 100);
  }, [data, dataset, activation, hiddenLayers, neurons, epoch, features, regularization, regularizationRate, learningRate, noise, batchSize, trainRatio, controlVersion]);

  const loss = Math.max(0.04, 1 - accuracy / 100 + 0.05);
  const testLoss = Math.max(0.05, loss + (showTest ? 0.02 : 0.04));

  const featureList = [
    { key: "x", label: "X₁" },
    { key: "y", label: "X₂" },
    { key: "x2", label: "X₁²" },
    { key: "y2", label: "X₂²" },
    { key: "xy", label: "X₁X₂" },
    { key: "sinX", label: "sin(X₁)" },
    { key: "sinY", label: "sin(X₂)" },
    { key: "cosX", label: "cos(X₁)" },
    { key: "cosY", label: "cos(X₂)" },
  ] as const;

  const datasetCards = [
    { key: "circle", icon: "◉", title: "Шеңбер" },
    { key: "xor", icon: "×", title: "XOR" },
    { key: "clusters", icon: "••", title: "Кластер" },
    { key: "spiral", icon: "↻", title: "Спираль" },
  ] as const;

  const layerXs = hiddenLayers === 1 ? [490] : hiddenLayers === 2 ? [390, 650] : [330, 540, 750];
  const inputYs = [85, 185, 285, 385];

  return (
    <SectionCard title="Нейрондық желі Playground симуляторы" accent="from-teal-600 to-amber-500">
      <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-[#fbfbf8] shadow-sm">
        <div className="grid gap-4 border-b border-slate-200 bg-white p-4 md:grid-cols-[190px_1fr] xl:grid-cols-[220px_1fr_170px_170px_170px_170px_170px]">
          <div className="flex items-center gap-4">
            <button onClick={() => setEpoch(0)} className="text-4xl font-black text-slate-700">↻</button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-950 text-4xl font-black text-white shadow-lg"
            >
              {isRunning ? "Ⅱ" : "▶"}
            </button>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-500">Epoch</div>
            <div className="font-mono text-4xl font-black text-slate-900">{String(epoch).padStart(6, "0")}</div>
          </div>

          <label className="space-y-1">
            <div className="text-sm font-bold text-slate-500">Learning rate</div>
            <select value={learningRate} onChange={(e) => { setLearningRate(Number(e.target.value)); setEpoch(0); bumpControls(); }} className="w-full border-b border-slate-300 bg-white py-2">
              <option value={0.01}>0.01</option>
              <option value={0.03}>0.03</option>
              <option value={0.1}>0.1</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-sm font-bold text-slate-500">Activation</div>
            <select value={activation} onChange={(e) => { setActivation(e.target.value as any); setEpoch(0); bumpControls(); }} className="w-full border-b border-slate-300 bg-white py-2">
              <option value="tanh">Tanh</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="relu">ReLU</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-sm font-bold text-slate-500">Regularization</div>
            <select value={regularization} onChange={(e) => { setRegularization(e.target.value as any); setEpoch(0); bumpControls(); }} className="w-full border-b border-slate-300 bg-white py-2">
              <option value="L2">L2</option>
              <option value="none">None</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-sm font-bold text-slate-500">Regularization rate</div>
            <select value={regularizationRate} onChange={(e) => { setRegularizationRate(Number(e.target.value)); setEpoch(0); bumpControls(); }} className="w-full border-b border-slate-300 bg-white py-2">
              <option value={0}>0</option>
              <option value={0.001}>0.001</option>
              <option value={0.003}>0.003</option>
              <option value={0.01}>0.01</option>
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-sm font-bold text-slate-500">Problem type</div>
            <div className="border-b border-slate-300 py-2 font-bold">Classification</div>
          </label>
        </div>

        <div className="grid gap-4 p-5 xl:grid-cols-[105px_118px_minmax(500px,1fr)_275px]">
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-900">DATA</h3>
              <p className="mt-1 text-xs leading-4 text-slate-600">Dataset</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {datasetCards.map((d) => (
                <button
                  key={d.key}
                  title={d.title}
                  onClick={() => {
                    setDataset(d.key); bumpControls();
                    setEpoch(0);
                  }}
                  className={
                    dataset === d.key
                      ? "h-12 rounded-xl border-4 border-slate-900 bg-white text-xl font-black text-teal-800 shadow"
                      : "h-12 rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-400"
                  }
                >
                  {d.icon}
                </button>
              ))}
            </div>

            <RangeField label="Оқыту дерегі" value={trainRatio} min={20} max={80} step={5} unit="%" onChange={(v) => { setTrainRatio(v); setEpoch(0); bumpControls(); }} />
            <RangeField label="Шу" value={noise} min={0} max={30} step={1} onChange={(v) => { setNoise(v); setEpoch(0); bumpControls(); }} />
            <RangeField label="Batch" value={batchSize} min={4} max={32} step={4} onChange={(v) => { setBatchSize(v); setEpoch(0); bumpControls(); }} />

            <button
              onClick={() => {
                setEpoch(0);
                setIsRunning(false);
              }}
              className="w-full rounded-xl border border-teal-700 bg-white px-4 py-3 text-sm font-black text-teal-900 hover:bg-teal-50"
            >
              ҚАЙТА ЖАСАУ
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">FEATURES</h3>
              <p className="mt-1 text-[11px] leading-4 text-slate-600">Белгілер</p>
            </div>

            {featureList.map((f) => (
              <button
                key={f.key}
                onClick={() => { setFeatures((old) => ({ ...old, [f.key]: !old[f.key] })); setEpoch(0); bumpControls(); }}
                className="grid w-full grid-cols-[48px_1fr] items-center gap-2 rounded-xl bg-transparent py-0.5 text-left"
              >
                <span className="text-right text-xs font-black text-slate-700">{f.label}</span>
                <span
                  className={
                    features[f.key]
                      ? "h-8 w-12 rounded-lg bg-gradient-to-r from-amber-300 to-teal-500 shadow"
                      : "h-8 w-12 rounded-lg bg-slate-200 opacity-60"
                  }
                />
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => { setHiddenLayers(Math.max(1, hiddenLayers - 1)); setEpoch(0); bumpControls(); }} className="h-11 w-11 rounded-full bg-white text-2xl font-black shadow">−</button>
              <div className="text-xl font-black text-slate-900">{hiddenLayers} HIDDEN LAYERS</div>
              <button onClick={() => { setHiddenLayers(Math.min(3, hiddenLayers + 1)); setEpoch(0); bumpControls(); }} className="h-11 w-11 rounded-full bg-white text-2xl font-black shadow">+</button>
            </div>

            <div className="flex items-center justify-center gap-5">
              <button onClick={() => { setNeurons(Math.max(3, neurons - 1)); setEpoch(0); bumpControls(); }} className="h-10 w-10 rounded-full bg-white text-2xl font-black shadow">−</button>
              <div className="rounded-2xl bg-white px-6 py-2 text-lg font-black shadow">{neurons} neurons</div>
              <button onClick={() => { setNeurons(Math.min(12, neurons + 1)); setEpoch(0); bumpControls(); }} className="h-10 w-10 rounded-full bg-white text-2xl font-black shadow">+</button>
            </div>

            <svg viewBox="0 0 980 520" className="min-h-[500px] w-full rounded-[32px] bg-white shadow">
              {inputYs.map((y, i) => (
                <g key={`input-${i}`}>
                  <text x="25" y={y + 7} fontSize="23" fontFamily="Arial" fontWeight="800" fill="#64748b">
                    {i === 0 ? "X₁" : i === 1 ? "X₂" : i === 2 ? "X₁²" : "X₁X₂"}
                  </text>
                  <rect x="75" y={y - 18} width="38" height="38" rx="7" fill={i % 2 === 0 ? "#14b8a6" : "#f59e0b"} opacity="0.95" />
                </g>
              ))}

              {layerXs.map((x, layer) =>
                Array.from({ length: neurons }).map((_, i) => {
                  const y = 45 + i * (420 / Math.max(1, neurons - 1));
                  return (
                    <g key={`h-${layer}-${i}`} className="transition-all duration-500">
                      <rect x={x - 22} y={y - 22} width="48" height="48" rx="8" fill="white" stroke="#0f172a" strokeWidth="3" />
                      <rect x={x - 16} y={y - 16} width="36" height="36" rx="6" fill={i % 2 === 0 ? "#14b8a6" : "#f59e0b"} opacity="0.72" />
                    </g>
                  );
                })
              )}

              {[185, 315].map((y, i) => (
                <g key={`out-${i}`}>
                  <rect x="905" y={y - 22} width="48" height="48" rx="8" fill="white" stroke="#0f172a" strokeWidth="3" />
                  <rect x="841" y={y - 16} width="36" height="36" rx="6" fill={i === 0 ? "#f59e0b" : "#14b8a6"} opacity="0.85" />
                </g>
              ))}

              {inputYs.flatMap((y1, a) =>
                Array.from({ length: neurons }).map((_, b) => {
                  const y2 = 45 + b * (420 / Math.max(1, neurons - 1));
                  return <line key={`l0-${a}-${b}`} x1="113" y1={y1} x2={layerXs[0] - 22} y2={y2} stroke={b % 2 === 0 ? "#14b8a6" : "#f59e0b"} strokeWidth={1 + ((epoch + b) % 4)} opacity="0.34" />;
                })
              )}

              {layerXs.slice(0, -1).flatMap((x, layer) =>
                Array.from({ length: neurons }).flatMap((_, a) =>
                  Array.from({ length: neurons }).map((_, b) => {
                    const x1 = x + 26;
                    const x2 = layerXs[layer + 1] - 22;
                    const y1 = 45 + a * (420 / Math.max(1, neurons - 1));
                    const y2 = 45 + b * (420 / Math.max(1, neurons - 1));
                    return <line key={`lh-${layer}-${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={b % 2 === 0 ? "#14b8a6" : "#f59e0b"} strokeWidth={1 + ((epoch + a + b) % 4)} opacity="0.24" />;
                  })
                )
              )}

              {Array.from({ length: neurons }).flatMap((_, a) =>
                [185, 315].map((y2, b) => {
                  const lastX = layerXs[layerXs.length - 1];
                  const y1 = 45 + a * (420 / Math.max(1, neurons - 1));
                  return <line key={`lo-${a}-${b}`} x1={lastX + 26} y1={y1} x2="905" y2={y2} stroke={b === 0 ? "#f59e0b" : "#14b8a6"} strokeWidth={1 + ((epoch + a + b) % 4)} opacity="0.35" />;
                })
              )}

              <circle r="8" fill="#facc15">
                <animateMotion dur="2.2s" repeatCount="indefinite" path={`M 95 170 C 180 130, 230 100, ${layerXs[0]} 115 C 430 150, 560 180, ${layerXs[layerXs.length - 1]} 150 C 820 170, 870 225, 930 315`} />
              </circle>

              <text x="285" y="505" fontSize="17" fontFamily="Arial" fill="#64748b" fontStyle="italic">
                Сызық қалыңдығы — салмақ, сары нүкте — ақпарат сигналы
              </text>
            </svg>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">OUTPUT</h3>
              <div className="mt-2 text-xs leading-5 text-slate-700">
                Test loss {testLoss.toFixed(3)}<br />
                Training loss {loss.toFixed(3)}
              </div>
<div className="mt-3 rounded-2xl bg-white p-2 text-xs font-bold text-slate-800 shadow-sm">
                Қазіргі баптау: {hiddenLayers} қабат · {neurons} нейрон · {activation} · дәлдік {accuracy}%
              </div>
            </div>

            <svg viewBox="0 0 280 280" className="mx-auto w-[250px] rounded-3xl border border-slate-200 bg-white">
              {grid.map((c, i) => {
                const teal = c.v > 0;
                const intensity = discretize ? 0.68 : Math.min(0.8, Math.abs(c.v) * 0.68 + 0.08);
                return (
                  <rect
                    key={i}
                    x={c.x * (280 / 46)}
                    y={c.y * (280 / 46)}
                    width={280 / 46 + 0.5}
                    height={280 / 46 + 0.5}
                    fill={teal ? `rgba(20, 184, 166, ${intensity})` : `rgba(245, 158, 11, ${intensity})`}
                  />
                );
              })}

              {data
                .filter((p) => showTest || !p.test)
                .map((p, i) => (
                  <circle
                    key={i}
                    cx={(p.x + 1) * 140}
                    cy={(1 - (p.y + 1) / 2) * 280}
                    r={p.test ? 4 : 5.5}
                    fill={p.label === 1 ? "#0f766e" : "#d97706"}
                    stroke="white"
                    strokeWidth="1.5"
                    opacity={p.test ? 0.55 : 1}
                  />
                ))}
            </svg>

            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-700">Түсіндірме</div>
              <div className="h-4 rounded-full bg-gradient-to-r from-amber-400 via-white to-teal-600" />
              <div className="flex justify-between text-sm text-slate-500">
                <span>-1</span><span>0</span><span>1</span>
              </div>
            </div>

            <label className="flex items-center gap-2 rounded-2xl bg-white p-3 font-bold text-slate-700">
              <input type="checkbox" checked={showTest} onChange={(e) => setShowTest(e.target.checked)} />
              Тест деректерін көрсету
            </label>
            <label className="flex items-center gap-2 rounded-2xl bg-white p-3 font-bold text-slate-700">
              <input type="checkbox" checked={discretize} onChange={(e) => setDiscretize(e.target.checked)} />
              Шығысты дискреттеу
            </label>
          </div>
        </div>

        <div className="m-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900">Бұл не үшін керек?</h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Бұл симулятор нейрондық желінің деректерді қалай ажырататынын көрсетеді. Нүктелер — дайын деректер,
            фон түсі — модельдің шешім аймағы, ал ортадағы байланыстар — нейрондар арасындағы салмақтар.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <SmallInfo title="Не үшін қолданылады?" text="Деректер арасындағы заңдылықты көзбен көру үшін." />
            <SmallInfo title="Нені анықтайды?" text="Кіріс белгілері бойынша объектінің қай класқа жататынын анықтайды." />
            <SmallInfo title="Не өзгереді?" text="Оқыту жүрген сайын шешім шекарасы және салмақтар өзгереді." />
            <SmallInfo title="Қалай жұмыс істейді?" text="Кіріс → жасырын қабат → салмақ → activation → нәтиже." />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-3 text-lg font-black text-slate-900">Қалай пайдаланамыз?</div>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
                <li>Dataset таңдаңыз.</li>
                <li>Керек белгілерді қосыңыз немесе өшіріңіз.</li>
                <li>Жасырын қабат пен нейрон санын өзгертіңіз.</li>
                <li>Play батырмасын басып, оқыту процесін бастаңыз.</li>
                <li>OUTPUT графигінен шешім аймағын бақылаңыз.</li>
              </ol>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <div className="mb-3 text-lg font-black text-amber-950">Кеңес</div>
              <p className="text-sm leading-6 text-amber-900">
                Нейрон немесе қабат саны көбейсе, желі күрделі заңдылықты жақсы үйренеді.
                Бірақ тым көбейсе, модель артық үйренуі мүмкін. Бұл overfitting деп аталады.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}




function PlaygroundGuideCards() {
  return (
    <SectionCard title="Симуляторды қалай түсіну керек?" accent="from-cyan-600 to-blue-600">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SmallInfo title="Dataset" text="Желі үйренетін деректер жиыны. Нүктелер екі класқа бөлінеді." />
        <SmallInfo title="Features" text="Шешім қабылдауға қолданылатын белгілер. Белгіні қосқанда шекара өзгеруі мүмкін." />
        <SmallInfo title="Hidden layers" text="Ақпаратты аралық өңдейтін жасырын қабаттар. Қабат көбейсе, модель күрделірек заңдылықты үйренеді." />
        <SmallInfo title="Neurons" text="Әр қабаттағы есептеу элементтері. Нейрон көп болса, байланыс саны артады." />
        <SmallInfo title="Learning rate" text="Оқыту жылдамдығы. Өте үлкен болса, модель тұрақсыз үйренуі мүмкін." />
        <SmallInfo title="Output" text="Фон түсі модельдің болжамын, ал нүктелер нақты деректерді көрсетеді." />
      </div>
    </SectionCard>
  );
}

function WhyResultChangedGuide() {
  return (
    <SectionCard title="Неге нәтиже өзгерді?" accent="from-emerald-600 to-teal-600">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="mb-3 text-xl font-black text-slate-900">Өзгеріске әсер ететін себептер</div>
          <div className="space-y-3 text-sm leading-6 text-slate-700">
            <div>✓ Белгі қосылса, желі жаңа ақпаратты пайдаланады.</div>
            <div>✓ Нейрон саны артса, модель күрделі шекара құра алады.</div>
            <div>✓ Жасырын қабат көбейсе, деректер тереңірек өңделеді.</div>
            <div>✓ Learning rate өзгерсе, оқыту жылдамдығы өзгереді.</div>
            <div>✓ Noise көбейсе, деректер шатасып, дәлдік төмендеуі мүмкін.</div>
          </div>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-3 text-xl font-black text-amber-950">Есте сақта!</div>
          <p className="text-sm leading-6 text-amber-900">
            Нейрондық желі дайын ережемен жұмыс істемейді. Ол мысалдарға қарап заңдылықты табады.
            Сондықтан параметрлер өзгерсе, желінің шешім аймағы да өзгереді.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

function ApplicationsShowcase() {
  const items = [
    { icon: "📷", title: "Компьютерлік көру", text: "Сурет пен бейнеден объектілерді анықтау." },
    { icon: "🎤", title: "Дыбысты тану", text: "Дауысты мәтінге айналдыру және дыбыс түрін анықтау." },
    { icon: "🏥", title: "Медицина", text: "Симптомдар немесе медициналық суреттер бойынша болжам жасау." },
    { icon: "🚗", title: "Автокөлік", text: "Жаяу жүргінші, жол белгісі және қауіпті аймақты анықтау." },
    { icon: "🌦️", title: "Ауа райы", text: "Температура, ылғалдылық, қысым арқылы болжам жасау." },
    { icon: "📚", title: "Білім беру", text: "Оқушы нәтижесін талдау және жеке оқу бағытын ұсыну." },
  ];

  return (
    <SectionCard title="Нейрондық желі қайда қолданылады?" accent="from-violet-600 to-fuchsia-600">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 text-4xl">{item.icon}</div>
            <div className="text-lg font-black text-slate-900">{item.title}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{item.text}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function OverfittingGuide() {
  return (
    <SectionCard title="Overfitting деген не?" accent="from-orange-500 to-red-500">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-lg font-black text-slate-900">Қарапайым түсінік</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Overfitting — модельдің оқыту деректерін тым қатты жаттап алып, жаңа деректерде нашар жұмыс істеуі.
          </p>
          <AnimatedFlow steps={["Оқыту дерегі", "Жаттап алу", "Жаңа дерек", "Қате нәтиже"]} />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <BarChart
            title="Overfitting кезінде не болады?"
            data={[
              { label: "Оқыту дәлдігі", value: 96 },
              { label: "Тест дәлдігі", value: 62 },
              { label: "Жалпылау", value: 48 },
            ]}
          />
        </div>
      </div>
    </SectionCard>
  );
}

function GlossarySection() {
  const terms = [
    ["Нейрон", "Кіріс мәндерін қабылдап, есептеп, шығыс беретін негізгі элемент."],
    ["Салмақ", "Кіріс дерегінің қаншалықты маңызды екенін көрсететін коэффициент."],
    ["Bias", "Нейрон нәтижесін ығыстыратын қосымша мән."],
    ["Activation", "Нейрон шығысын түрлендіретін функция."],
    ["Epoch", "Оқыту деректерінен бір толық өту кезеңі."],
    ["Loss", "Модель қатесінің сандық көрсеткіші."],
    ["Dataset", "Модельді үйретуге арналған деректер жиыны."],
    ["Overfitting", "Модельдің деректерді жаттап алып, жаңа деректерде қателесуі."],
  ];

  return (
    <SectionCard title="Қысқаша терминдер сөздігі" accent="from-slate-700 to-slate-900">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {terms.map(([term, text]) => (
          <div key={term} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="font-black text-slate-900">{term}</div>
            <div className="mt-2 text-sm leading-6 text-slate-700">{text}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}


function FlowPage() {
  const examples = [
    {
      title: "Сурет мысалы",
      steps: ["Мысық суреті", "Пиксель", "Мұрт/құлақ", "Нейрон", "Мысық"],
      img: "/visuals/image-processing.svg",
      text: "Сурет пиксельдерге бөлінеді, одан белгілер алынады, модель класс анықтайды.",
    },
    {
      title: "Ауа райы мысалы",
      steps: ["Температура", "Ылғал", "Жел/қысым", "Нейрон", "Жаңбыр"],
      img: "/visuals/weather-ai.svg",
      text: "Ауа райы деректері бірге талданып, ықтимал болжам таңдалады.",
    },
    {
      title: "Цифр мысалы",
      steps: ["Жазылған цифр", "28×28", "Сызықтар", "Нейрон", "2"],
      img: "/visuals/digit-recognition.svg",
      text: "Қолжазба цифр кішірейтіліп, қара пиксельдердің орналасуы бойынша анықталады.",
    },
  ];
  const [idx, setIdx] = useState(0);
  const item = examples[idx];

  return (
    <div className="space-y-6">
      <PlaygroundLikeSimulator />
      <PlaygroundGuideCards />
      <WhyResultChangedGuide />
      <ApplicationsShowcase />
      <OverfittingGuide />
      <GlossarySection />

      <SectionCard title="Ақпараттың нейрондық желі ішінде жүруі" accent="from-blue-600 to-cyan-600">
        <div className="grid gap-5 lg:grid-cols-2">
          <VisualImage src={item.img} title={item.title} text={item.text} />
          <div className="space-y-4">
            <AnimatedFlow steps={item.steps} />
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, i) => (
                <button
                  key={ex.title}
                  onClick={() => setIdx(i)}
                  className={
                    idx === i
                      ? "rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white"
                      : "rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
                  }
                >
                  {ex.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <AnimatedSignalChart title="Нейрондар арасындағы сигнал қозғалысы" label="Ақпарат сигналы" />

      <SectionCard title="Бір мысал: ақпарат қалай жіберіледі?" accent="from-violet-600 to-indigo-600">
        <div className="grid gap-4 md:grid-cols-5">
          <SmallInfo title="1. Дерек кіреді" text="Мысалы, температура=18°C, ылғал=82%, жел=5 м/с." />
          <SmallInfo title="2. Нормализация" text="Деректер 0 мен 1 аралығына жақындатылып өңдеуге дайындалады." />
          <SmallInfo title="3. Салмақ" text="Нейрон ылғалдылықты маңызды, желді орташа маңызды деп бағалайды." />
          <SmallInfo title="4. Activation" text="Есептелген мән 0–1 аралығындағы ықтималдыққа айналады." />
          <SmallInfo title="5. Нәтиже" text="Ылғал жоғары және қысым төмен болса, жаңбыр ықтималдығы артады." />
        </div>
      </SectionCard>
    </div>
  );
}

function MethodPage() {
  return (
    <div className="space-y-6">
      {methodTopics.map((topic, idx) => (
        <SectionCard key={idx} title={topic.title} accent="from-indigo-600 to-blue-600">
          <div className="space-y-4">
            <SmallInfo title="Мақсат" text={topic.explain} />
            <Formula>{topic.formula}</Formula>
            <SmallInfo title="Қалай орындалады?" text={topic.how} />
            <SmallInfo title="Мысал" text={topic.example} />
            {topic.video && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="mb-2 font-bold text-blue-900">Видео сабақ</div>
                <p className="mb-3 text-sm text-slate-700">
                  Бұл тақырыпқа байланысты қосымша видео сабақ сыртқы сілтеме арқылы беріледі.
                </p>
                <a
                  href={youtubeWatch(topic.video)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Видео сабаққа өту
                </a>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <SmallInfo title="Тапсырма 1" text={topic.task1} />
              <SmallInfo title="Тапсырма 2" text={topic.task2} />
            </div>
            <TopicOutput outputType={topic.outputType} title={topic.title} />
            <PythonRunner
              defaultCode={topic.code}
              title={`${topic.title} — Python симуляторы`}
              graphTitle={topic.graphTitle || "График"}
            />
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function NeuronFormulaExplainer({
  x1,
  x2,
  w1,
  w2,
  b,
  activation,
  z,
  y,
}: {
  x1: number;
  x2: number;
  w1: number;
  w2: number;
  b: number;
  activation: ActivationName;
  z: number;
  y: number;
}) {
  return (
    <div className="space-y-4">
      <Formula>{`z = w₁x₁ + w₂x₂ + b
z = ${round(w1, 2)}·${round(x1, 2)} + ${round(w2, 2)}·${round(x2, 2)} + ${round(b, 2)}
z = ${round(z, 4)}

y = ${activation}(z)
y = ${round(y, 4)}`}</Formula>

      <div className="grid gap-3 md:grid-cols-2">
        <SmallInfo title="x₁ және x₂" text="Бұл — кіріс мәндер. Яғни нейронға берілетін бастапқы ақпарат." />
        <SmallInfo title="w₁ және w₂" text="Бұл — салмақтар. Қай кіріс қаншалық маңызды екенін көрсетеді." />
        <SmallInfo title="b (bias)" text="Bias — қосымша ығысу. Ол нейронның шешім шекарасын өзгертеді." />
        <SmallInfo title="activation" text="Activation функциясы z мәнін соңғы нәтижеге түрлендіреді." />
      </div>
    </div>
  );
}

function TwoNeuronDemo() {
  const [x1, setX1] = useState(0.6);
  const [x2, setX2] = useState(0.4);

  const h1 = relu(x1 * 0.8 + x2 * 0.3 - 0.1);
  const h2 = relu(x1 * -0.4 + x2 * 1.1 + 0.2);
  const out = sigmoid(h1 * 1.2 + h2 * 0.7 - 0.5);

  return (
    <SectionCard title="Екі нейрон қалай жұмыс істейді?" accent="from-emerald-600 to-cyan-600">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <RangeField label="x₁ кірісі" value={x1} min={0} max={1} step={0.01} onChange={setX1} />
          <RangeField label="x₂ кірісі" value={x2} min={0} max={1} step={0.01} onChange={setX2} />
          <Formula>{`Нейрон 1: h₁ = ReLU(0.8x₁ + 0.3x₂ - 0.1) = ${round(h1, 3)}
Нейрон 2: h₂ = ReLU(-0.4x₁ + 1.1x₂ + 0.2) = ${round(h2, 3)}
Шығыс: y = sigmoid(1.2h₁ + 0.7h₂ - 0.5) = ${round(out, 3)}`}</Formula>
        </div>
        <div className="space-y-4">
          <AnimatedFlow steps={["x₁, x₂", "Нейрон 1", "Нейрон 2", "Шығыс", out > 0.5 ? "Иә" : "Жоқ"]} />
          <SmallInfo
            title="Неге екі нейрон керек?"
            text="Бір нейрон бір ғана қарапайым заңдылықты ұстайды. Бірнеше нейрон бірге жұмыс істесе, күрделірек белгілерді анықтай алады."
          />
        </div>
      </div>
    </SectionCard>
  );
}

function NeuronPage() {
  const [x1, setX1] = useState(0.5);
  const [x2, setX2] = useState(0.3);
  const [w1, setW1] = useState(0.8);
  const [w2, setW2] = useState(0.6);
  const [b, setB] = useState(0.2);
  const [activation, setActivation] = useState<ActivationName>("sigmoid");

  const z = w1 * x1 + w2 * x2 + b;
  const y = activate(z, activation);

  const graphX: number[] = [];
  const graphY: number[] = [];
  for (let xx = -10; xx <= 10; xx += 1) {
    graphX.push(xx);
    graphY.push(activate(w1 * xx + w2 * x2 + b, activation));
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Бір нейрон" accent="from-blue-600 to-cyan-600">
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <VisualImage
              src="/visuals/neuron-structure.svg"
              title="Нейронның құрылысы"
              text="Кіріс мәндер салмақтарға көбейіп, bias қосылады. Содан кейін activation функциясы нәтиже береді."
            />
            <RangeField label="x₁ кірісі" value={x1} min={0} max={1} step={0.01} onChange={setX1} />
            <RangeField label="x₂ кірісі" value={x2} min={0} max={1} step={0.01} onChange={setX2} />
            <RangeField label="w₁ салмағы" value={w1} min={-2} max={2} step={0.01} onChange={setW1} />
            <RangeField label="w₂ салмағы" value={w2} min={-2} max={2} step={0.01} onChange={setW2} />
            <RangeField label="b bias" value={b} min={-2} max={2} step={0.01} onChange={setB} />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 font-bold text-slate-900">Activation функциясын таңдаңыз</div>
              <select
                value={activation}
                onChange={(e) => setActivation(e.target.value as ActivationName)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3"
              >
                <option value="sigmoid">Sigmoid</option>
                <option value="relu">ReLU</option>
                <option value="tanh">Tanh</option>
                <option value="linear">Linear</option>
              </select>
            </div>

            <NeuronFormulaExplainer x1={x1} x2={x2} w1={w1} w2={w2} b={b} activation={activation} z={z} y={y} />
          </div>

          <div className="space-y-4">
            <AnimatedFlow steps={["x₁,x₂", "w·x", "bias", activation, "y"]} />
            <AnimatedSignalChart title="Нейрон ішіндегі сигнал" label="w·x + b" />
            <InlineLineChart xValues={graphX} yValues={graphY} title={`y = ${activation}(w₁·x + w₂·x₂ + b)`} />
            <SmallInfo
              title="Нейрон неге осылай шешті?"
              text={`Қазір z=${round(z, 3)}. ${activation} функциясы осы мәнді y=${round(
                y,
                3
              )} нәтижесіне айналдырды. Салмақ жоғары болса, кіріс мәннің әсері де жоғары болады.`}
            />
          </div>
        </div>
      </SectionCard>

      <TwoNeuronDemo />
    </div>
  );
}


function DecisionMiniSimulator({
  title,
  icon,
  aLabel,
  bLabel,
  cLabel,
  positive,
  negative,
  explanation,
}: {
  title: string;
  icon: string;
  aLabel: string;
  bLabel: string;
  cLabel: string;
  positive: string;
  negative: string;
  explanation: string;
}) {
  const [a, setA] = useState(0.7);
  const [b, setB] = useState(0.4);
  const [c, setC] = useState(0.8);
  const score = clamp(a * 0.42 + b * 0.22 + c * 0.36, 0, 1);
  const result = score >= 0.55 ? positive : negative;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl">{icon}</div>
        <div>
          <div className="text-xl font-black text-slate-900">{title}</div>
          <div className="text-sm leading-6 text-slate-600">{explanation}</div>
        </div>
      </div>

      <div className="space-y-3">
        <RangeField label={aLabel} value={a} min={0} max={1} step={0.05} onChange={setA} />
        <RangeField label={bLabel} value={b} min={0} max={1} step={0.05} onChange={setB} />
        <RangeField label={cLabel} value={c} min={0} max={1} step={0.05} onChange={setC} />
      </div>

      <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-white">
        <div className="text-sm text-slate-300">Нәтиже</div>
        <div className="text-2xl font-black">{result}</div>
        <div className="mt-2 text-sm text-slate-300">Ұқсастық көрсеткіші: {Math.round(score * 100)}%</div>
      </div>
    </div>
  );
}


function ImagePage() {
  const [earSharpness, setEarSharpness] = useState(0.8);
  const [whiskers, setWhiskers] = useState(0.9);
  const [snoutLength, setSnoutLength] = useState(0.3);
  const [tailSlimness, setTailSlimness] = useState(0.7);
  const [showResult, setShowResult] = useState(false);

  const catScore = clamp(
    earSharpness * 0.35 + whiskers * 0.35 + tailSlimness * 0.2 + (1 - snoutLength) * 0.1,
    0,
    1
  );
  const dogScore = clamp(
    (1 - earSharpness) * 0.25 + (1 - whiskers) * 0.15 + snoutLength * 0.4 + (1 - tailSlimness) * 0.2,
    0,
    1
  );
  const result = catScore >= dogScore ? "cat" : "dog";

  const makeAnimalSvg = (kind: "cat" | "dog") => {
    if (kind === "cat") {
      return `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 240'>
          <rect width='320' height='240' fill='#fdf2f8'/>
          <polygon points='90,70 120,25 145,75' fill='#f59e0b'/>
          <polygon points='230,70 200,25 175,75' fill='#f59e0b'/>
          <circle cx='160' cy='120' r='70' fill='#fbbf24'/>
          <circle cx='135' cy='110' r='8' fill='#111827'/>
          <circle cx='185' cy='110' r='8' fill='#111827'/>
          <line x1='118' y1='134' x2='70' y2='120' stroke='#111827' stroke-width='3'/>
          <line x1='118' y1='144' x2='70' y2='150' stroke='#111827' stroke-width='3'/>
          <line x1='202' y1='134' x2='250' y2='120' stroke='#111827' stroke-width='3'/>
          <line x1='202' y1='144' x2='250' y2='150' stroke='#111827' stroke-width='3'/>
          <polygon points='160,125 148,138 172,138' fill='#111827'/>
          <path d='M145 150 Q160 165 175 150' stroke='#111827' stroke-width='4' fill='none'/>
          <text x='160' y='220' text-anchor='middle' font-size='24' font-weight='700' fill='#111827'>Мысық</text>
        </svg>
      `)}`;
    }

    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 240'>
        <rect width='320' height='240' fill='#eff6ff'/>
        <ellipse cx='105' cy='82' rx='25' ry='42' fill='#92400e'/>
        <ellipse cx='215' cy='82' rx='25' ry='42' fill='#92400e'/>
        <circle cx='160' cy='120' r='70' fill='#d97706'/>
        <circle cx='135' cy='110' r='8' fill='#111827'/>
        <circle cx='185' cy='110' r='8' fill='#111827'/>
        <ellipse cx='160' cy='140' rx='25' ry='16' fill='#111827'/>
        <path d='M145 164 Q160 180 175 164' stroke='#111827' stroke-width='4' fill='none'/>
        <text x='160' y='220' text-anchor='middle' font-size='24' font-weight='700' fill='#111827'>Ит</text>
      </svg>
    `)}`;
  };

  const reasons =
    result === "cat"
      ? [
          whiskers > 0.6 ? "Мұрт белгілері анық" : "Мұрт белгісі орташа",
          earSharpness > 0.6 ? "Құлақ үшкірлігі жоғары" : "Құлақ үшкірлігі орташа",
          snoutLength < 0.5 ? "Тұмсық қысқа" : "Тұмсық ұзындау",
          tailSlimness > 0.5 ? "Құйрық жіңішке" : "Құйрық белгісі орташа",
        ]
      : [
          snoutLength > 0.5 ? "Тұмсық ұзын" : "Тұмсық белгісі орташа",
          earSharpness < 0.6 ? "Құлақ үшкірлігі төмен" : "Құлақ белгісі аралас",
          whiskers < 0.6 ? "Мұрт белгісі әлсіз" : "Мұрт белгісі бар, бірақ ит ықтималдығы жоғары",
          tailSlimness < 0.5 ? "Құйрық жуан/қысқа" : "Құйрық белгісі аралас",
        ];

  return (
    <SectionCard title="Мысық пен итті ажырату" accent="from-pink-600 to-orange-500">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <VisualImage
            src="/visuals/image-processing.svg"
            title="Сурет нейрондық желіге қалай түседі?"
            text="Сурет пиксельдерге бөлініп, құлақ, мұрт, тұмсық сияқты белгілер арқылы талданады."
          />
          <RangeField label="Құлақтың үшкірлігі" value={earSharpness} min={0} max={1} step={0.01} onChange={(v) => { setEarSharpness(v); setShowResult(false); }} />
          <RangeField label="Мұрт белгілері" value={whiskers} min={0} max={1} step={0.01} onChange={(v) => { setWhiskers(v); setShowResult(false); }} />
          <RangeField label="Тұмсық ұзындығы" value={snoutLength} min={0} max={1} step={0.01} onChange={(v) => { setSnoutLength(v); setShowResult(false); }} />
          <RangeField label="Құйрық жіңішкелігі" value={tailSlimness} min={0} max={1} step={0.01} onChange={(v) => { setTailSlimness(v); setShowResult(false); }} />
          <button onClick={() => setShowResult(true)} className="rounded-2xl bg-pink-600 px-5 py-3 text-white">
            Нәтижені шығару
          </button>
        </div>

        <div className="space-y-4">
          <AnimatedFlow steps={["Сурет", "Белгілер", "Салмақ", "Нейрон", result === "cat" ? "Мысық" : "Ит"]} />
          {showResult && (
            <>
              <Formula>{`Нәтиже: ${result === "cat" ? "Мысық" : "Ит"}
Мысық ықтималдығы: ${round(catScore * 100, 1)}%
Ит ықтималдығы: ${round(dogScore * 100, 1)}%`}</Formula>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center">
                <img src={makeAnimalSvg(result)} alt={result} className="mx-auto rounded-2xl border border-slate-200" />
              </div>

              <BarChart
                title="Белгілердің әсері"
                data={[
                  { label: "Құлақ", value: earSharpness * 100 },
                  { label: "Мұрт", value: whiskers * 100 },
                  { label: "Тұмсық", value: snoutLength * 100 },
                  { label: "Құйрық", value: tailSlimness * 100 },
                ]}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 font-bold text-slate-900">Неге бұлай шешті?</div>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                  {reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function DigitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [result, setResult] = useState<{ digit: number; scores: number[]; note: string } | null>(null);

  const templates: Record<number, string[]> = {
    0: ["11111", "10001", "10011", "10101", "11001", "10001", "11111"],
    1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    2: ["11110", "00001", "00001", "11110", "10000", "10000", "11111"],
    3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    4: ["10010", "10010", "10010", "11111", "00010", "00010", "00010"],
    5: ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    6: ["01111", "10000", "10000", "11110", "10001", "10001", "01110"],
    7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    9: ["01110", "10001", "10001", "01111", "00001", "00010", "11100"],
  };

  const drawTemplate = (digit: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    clear();
    ctx.fillStyle = "black";

    const tpl = templates[digit];
    const cellW = canvas.width / 5;
    const cellH = canvas.height / 7;

    tpl.forEach((row, y) => {
      row.split("").forEach((v, x) => {
        if (v === "1") {
          ctx.beginPath();
          ctx.roundRect(x * cellW + 16, y * cellH + 16, cellW - 32, cellH - 32, 18);
          ctx.fill();
        }
      });
    });

    setResult(null);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setResult(null);
  };

  useEffect(() => {
    clear();
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const canvas = canvasRef.current!;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineWidth = 28;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "black";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const end = () => {
    setDrawing(false);
  };

  const getCroppedGrid = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return null;

    const size = canvas.width;
    const img = ctx.getImageData(0, 0, size, size);
    const data = img.data;

    let minX = size;
    let maxX = 0;
    let minY = size;
    let maxY = 0;
    let blackCount = 0;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const darkness = 255 - data[i];
        if (darkness > 45) {
          blackCount++;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (blackCount < 80) return null;

    const pad = 18;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(size - 1, maxX + pad);
    maxY = Math.min(size - 1, maxY + pad);

    const grid: number[][] = Array.from({ length: 7 }, () => Array(5).fill(0));
    const counts: number[][] = Array.from({ length: 7 }, () => Array(5).fill(0));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const gx = Math.min(4, Math.floor(((x - minX) / Math.max(1, maxX - minX + 1)) * 5));
        const gy = Math.min(6, Math.floor(((y - minY) / Math.max(1, maxY - minY + 1)) * 7));
        const i = (y * size + x) * 4;
        const darkness = 255 - data[i];
        if (darkness > 45) grid[gy][gx] += 1;
        counts[gy][gx] += 1;
      }
    }

    const binary = grid.map((row, y) =>
      row.map((v, x) => (v / Math.max(1, counts[y][x]) > 0.08 ? 1 : 0))
    );

    return {
      binary,
      blackCount,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  };

  const recognize = () => {
    const gridInfo = getCroppedGrid();

    if (!gridInfo) {
      setResult({
        digit: 0,
        scores: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        note: "Цифр анық емес. Үлкенірек және қалыңырақ етіп жазыңыз.",
      });
      return;
    }

    const { binary, width, height } = gridInfo;
    const aspect = height / Math.max(1, width);

    const scores = Object.entries(templates).map(([digit, tpl]) => {
      let same = 0;
      let total = 0;

      tpl.forEach((row, y) => {
        row.split("").forEach((expected, x) => {
          const actual = binary[y][x] ? "1" : "0";
          if (actual === expected) same += 1;
          total += 1;
        });
      });

      let score = (same / total) * 100;

      // Қосымша пішіндік түзету: 1 өте жіңішке, 0/8 толық, 2-де жоғарғы-орта-төмен сызықтар бар.
      if (Number(digit) === 1 && aspect > 2.1) score += 10;
      if (Number(digit) === 2) {
        const top = binary[0].reduce<number>((a, b) => a + Number(b), 0);
        const mid = binary[3].reduce<number>((a, b) => a + Number(b), 0);
        const bottom = binary[6].reduce<number>((a, b) => a + Number(b), 0);
        const leftBottom = binary[5][0] + binary[6][0];
        const rightTop = binary[1][4] + binary[2][4];
        if (top >= 3 && mid >= 2 && bottom >= 3 && leftBottom >= 1 && rightTop >= 1) score += 15;
      }
      if (Number(digit) === 8) {
        const left = binary.reduce<number>((a, row) => a + Number(row[0]), 0);
        const right = binary.reduce<number>((a, row) => a + Number(row[4]), 0);
        const mid = binary[3].reduce<number>((a, b) => a + Number(b), 0);
        if (left >= 3 && right >= 3 && mid >= 2) score += 12;
      }

      if (Number(digit) === 9) {
        const top = binary[0].reduce<number>((a, b) => a + Number(b), 0);
        const mid = binary[3].reduce<number>((a, b) => a + Number(b), 0);
        const upperLeft = binary[1][0] + binary[2][0];
        const upperRight = binary[1][4] + binary[2][4];
        const lowerRight = binary[4][4] + binary[5][4];
        const lowerLeft = binary[4][0] + binary[5][0];
        if (top >= 3 && mid >= 3 && upperLeft >= 1 && upperRight >= 1 && lowerRight >= 1) score += 22;
        if (lowerLeft === 0) score += 8;
      }

      return { digit: Number(digit), score: clamp(score, 1, 100) };
    });

    scores.sort((a, b) => b.score - a.score);
    const best = scores[0];

    const normalized = new Array(10).fill(0);
    scores.forEach((s) => {
      normalized[s.digit] = Math.round(s.score);
    });

    setResult({
      digit: best.digit,
      scores: normalized,
      note:
        "Бұл оқу симуляторы цифрды 5×7 торға түсіріп, қолжазба пішінін шаблондармен салыстырады. Нәтиже дайын нейрондық модель емес, түсіндіруге арналған тану алгоритмі.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            className="touch-none rounded-3xl border-4 border-slate-300 bg-white"
          />

          <div className="flex flex-wrap gap-2">
            <button onClick={recognize} className="rounded-2xl bg-violet-600 px-5 py-3 font-bold text-white">
              Цифрды тану
            </button>
            <button onClick={clear} className="rounded-2xl bg-slate-200 px-5 py-3 font-bold text-slate-900">
              Тазалау
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 text-sm font-bold text-slate-900">Дайын мысалдар</div>
            <div className="flex flex-wrap gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                <button
                  key={d}
                  onClick={() => drawTemplate(d)}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm hover:bg-violet-50"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <VisualImage
            src="/visuals/digit-recognition.svg"
            title="Цифр қалай танылады?"
            text="Қолмен жазылған цифр 5×7 немесе 28×28 сияқты торға түсіп, сызықтардың орналасуы бойынша талданады."
          />
          <AnimatedFlow steps={["Жазу", "Торға түсіру", "Белгі", "Салыстыру", "Цифр"]} />
          {result && (
            <>
              <Formula>{`Нәтиже: ${result.digit}
Түсіндірме: ${result.note}`}</Formula>
              <BarChart
                title="Цифр ықтималдықтары"
                data={result.scores.map((v, i) => ({ label: String(i), value: v }))}
              />
            </>
          )}
        </div>
      </div>

    </div>
  );
}

function DigitPage() {
  return (
    <SectionCard title="Қолжазба цифрды тану" accent="from-violet-600 to-indigo-600">
      <DigitCanvas />
    </SectionCard>
  );
}

function SoundPage() {
  const [freq, setFreq] = useState(440);
  const [duration, setDuration] = useState(1.2);
  const [volume, setVolume] = useState(0.4);
  const [audioStatus, setAudioStatus] = useState("Дыбысты тыңдауға дайын");
  const [micResult, setMicResult] = useState("Микрофон іске қосылмаған");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#eef2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const t = x / canvas.width;
      const y = canvas.height / 2 + Math.sin(t * freq * 0.05) * volume * 70;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [freq, volume]);

  const playSound = async () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(volume, now);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
      setAudioStatus(`Дыбыс ойнатылып жатыр: ${freq} Hz`);
      osc.onended = () => setAudioStatus("Дыбыс тыңдалып болды");
    } catch {
      setAudioStatus("Дыбысты ойнату мүмкін болмады");
    }
  };

  const startMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicResult("Микрофон қосылды");
    } catch {
      setMicResult("Микрофонға рұқсат берілмеді. Браузердің адрес жолағындағы рұқсатты қосыңыз.");
    }
  };

  const soundType = freq < 300 ? "Төмен дыбыс" : freq < 900 ? "Орташа дыбыс" : "Жоғары дыбыс";

  return (
    <SectionCard title="Дыбыс бөлімі" accent="from-violet-600 to-fuchsia-600">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <VisualImage
            src="/visuals/sound-ai.svg"
            title="Дыбыс нейронға қалай түседі?"
            text="Дыбыс жиілік пен амплитуда белгілеріне бөлінеді. Нейрон осы белгілер арқылы дыбыс түрін анықтайды."
          />
          <RangeField label="Жиілік" value={freq} min={100} max={1500} step={1} unit="Hz" onChange={setFreq} />
          <RangeField label="Ұзақтық" value={duration} min={0.2} max={3} step={0.1} unit="сек." onChange={setDuration} />
          <RangeField label="Дыбыс қаттылығы" value={volume} min={0.1} max={1} step={0.01} unit="бірлік" onChange={setVolume} />
          <button onClick={playSound} className="rounded-2xl bg-violet-600 px-5 py-3 text-white">
            🔊 Дыбысты тыңдау
          </button>
          <button onClick={startMic} className="ml-2 rounded-2xl bg-indigo-600 px-5 py-3 text-white">
            🎤 Микрофонды тексеру
          </button>
          <Formula>{`Нәтиже: ${soundType}
Себебі: жиілік ${freq} Hz, дыбыс қаттылығы ${round(volume, 2)}.`}</Formula>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm">{audioStatus}</div>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm">{micResult}</div>
        </div>
        <div className="space-y-4">
          <canvas ref={canvasRef} width={560} height={240} className="w-full rounded-3xl border border-slate-200 bg-white" />
          <AnimatedFlow steps={["Дыбыс", "Толқын", "Жиілік", "Нейрон", soundType]} />
        </div>
      </div>
    </SectionCard>
  );
}

function WeatherIcon({ type }: { type: string }) {
  const icon = type === "Жаңбыр" ? "🌧️" : type === "Қар" ? "❄️" : type === "Дауыл" ? "⛈️" : "☀️";
  return (
    <div className="flex h-44 items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 to-blue-100 text-7xl">
      {icon}
    </div>
  );
}


function SymptomDiagnosisSimulator() {
  const [fever, setFever] = useState(false);
  const [cough, setCough] = useState(false);
  const [runnyNose, setRunnyNose] = useState(false);
  const [headache, setHeadache] = useState(false);
  const [throat, setThroat] = useState(false);
  const [fatigue, setFatigue] = useState(false);
  const [stomach, setStomach] = useState(false);

  const diseases = [
    {
      name: "Тұмау болуы мүмкін",
      icon: "🤒",
      score: (fever ? 30 : 0) + (cough ? 20 : 0) + (headache ? 15 : 0) + (fatigue ? 20 : 0) + (throat ? 10 : 0),
      text: "Қызу, жөтел, әлсіздік және бас ауруы бірге байқалса, тұмауға ұқсас белгі болуы мүмкін.",
    },
    {
      name: "ЖРВИ / суық тию болуы мүмкін",
      icon: "🤧",
      score: (runnyNose ? 30 : 0) + (cough ? 15 : 0) + (throat ? 20 : 0) + (fever ? 10 : 0) + (fatigue ? 10 : 0),
      text: "Мұрыннан су ағу, тамақ ауруы, жеңіл жөтел суық тиюге ұқсас белгілер болуы мүмкін.",
    },
    {
      name: "Бас ауруы / шаршау белгісі",
      icon: "😵",
      score: (headache ? 45 : 0) + (fatigue ? 20 : 0) + (!fever && headache ? 15 : 0),
      text: "Бас ауруы кейде шаршау, ұйқы жетіспеуі немесе кернеумен байланысты болуы мүмкін.",
    },
    {
      name: "Асқазан бұзылысы белгісі",
      icon: "🤢",
      score: (stomach ? 55 : 0) + (fatigue ? 10 : 0) + (fever ? 10 : 0),
      text: "Іштің ауыруы немесе жүрек айну асқазан-ішек жүйесімен байланысты белгі болуы мүмкін.",
    },
    {
      name: "Аллергия белгісі",
      icon: "🌿",
      score: (runnyNose ? 30 : 0) + (headache ? 10 : 0) + (!fever && runnyNose ? 20 : 0),
      text: "Қызусыз мұрыннан су ағу, түшкіру немесе бас ауыру аллергияға ұқсас белгі болуы мүмкін.",
    },
    {
      name: "Қан қысымы жоғары болуы мүмкін",
      icon: "🩺",
      score: (headache ? 30 : 0) + (fatigue ? 15 : 0) + (!cough && headache ? 15 : 0),
      text: "Бас ауруы мен әлсіздік кейде қан қысымының жоғарылауымен байланысты болуы мүмкін.",
    },
  ];

  const sorted = [...diseases].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const safeScore = clamp(best.score, 0, 100);

  const Toggle = ({
    checked,
    setChecked,
    label,
  }: {
    checked: boolean;
    setChecked: (v: boolean) => void;
    label: string;
  }) => (
    <button
      onClick={() => setChecked(!checked)}
      className={
        checked
          ? "rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white"
          : "rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
      }
    >
      {checked ? "✓ " : ""}{label}
    </button>
  );

  return (
    <SectionCard title="Симптомдарға қарап болжам жасау" accent="from-red-600 to-rose-600">
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Бұл медициналық диагноз емес. Бұл — нейрондық желі логикасын түсіндіруге арналған оқу симуляторы.
          Нақты денсаулық мәселесінде дәрігерге қаралу қажет.
        </div>

        <div className="flex flex-wrap gap-2">
          <Toggle checked={fever} setChecked={setFever} label="Қызу" />
          <Toggle checked={cough} setChecked={setCough} label="Жөтел" />
          <Toggle checked={runnyNose} setChecked={setRunnyNose} label="Мұрыннан су ағу" />
          <Toggle checked={headache} setChecked={setHeadache} label="Бас ауруы" />
          <Toggle checked={throat} setChecked={setThroat} label="Тамақ ауруы" />
          <Toggle checked={fatigue} setChecked={setFatigue} label="Әлсіздік" />
          <Toggle checked={stomach} setChecked={setStomach} label="Іш ауруы / жүрек айну" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center">
            <div className="text-6xl">{best.icon}</div>
            <div className="mt-3 text-2xl font-black text-slate-900">{best.name}</div>
            <div className="mt-2 text-xs leading-5 text-slate-700">{best.text}</div>
            <div className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-800">
              Ұқсастық көрсеткіші: {safeScore}%
            </div>
          </div>

          <BarChart
            title="Мүмкін жағдайлар ұқсастығы"
            data={diseases.map((d) => ({ label: d.name.replace(" болуы мүмкін", ""), value: clamp(d.score, 0, 100) }))}
          />
        </div>

        <AnimatedFlow steps={["Симптом", "Белгі", "Салмақ", "Салыстыру", "Болжам"]} />
      </div>
    </SectionCard>
  );
}

function SensorsPage() {
  const [temp, setTemp] = useState(18);
  const [humidity, setHumidity] = useState(82);
  const [wind, setWind] = useState(5);
  const [pressure, setPressure] = useState(744);
  const [bodyTemp, setBodyTemp] = useState(36.8);
  const [pulse, setPulse] = useState(78);
  const [bp, setBp] = useState(122);
  const [glucose, setGlucose] = useState(5.2);

  const weatherData = useMemo(() => {
    const rain = clamp(humidity * 0.5 + wind * 2 + (760 - pressure) * 0.8, 0, 100);
    const clear = clamp((100 - humidity) * 0.6 + temp * 1.4 + (pressure - 730) * 0.7, 0, 100);
    const snow = clamp(temp < 2 ? 70 + humidity * 0.25 : 8, 0, 100);
    const storm = clamp(wind > 12 && humidity > 70 ? 75 : wind * 2, 0, 100);
    const arr = [
      { label: "Жаңбыр", value: rain },
      { label: "Ашық", value: clear },
      { label: "Қар", value: snow },
      { label: "Дауыл", value: storm },
    ];
    const best = arr.reduce((a, b) => (b.value > a.value ? b : a));
    return { weather: best.label, values: arr };
  }, [temp, humidity, wind, pressure]);

  const health = useMemo(() => {
    let risk = 0;
    const reasons: string[] = [];
    if (bodyTemp > 37.5) {
      risk += 30;
      reasons.push("дене қызуы жоғары");
    }
    if (pulse > 95) {
      risk += 25;
      reasons.push("пульс жоғары");
    }
    if (bp > 140) {
      risk += 30;
      reasons.push("қан қысымы жоғары");
    }
    if (glucose > 7) {
      risk += 35;
      reasons.push("глюкоза жоғары");
    }
    const level = risk >= 50 ? "Қауіп жоғары" : risk >= 25 ? "Бақылау қажет" : "Қалыпты";
    return { risk: clamp(risk, 0, 100), level, reasons };
  }, [bodyTemp, pulse, bp, glucose]);

  return (
    <div className="space-y-6">
      <SectionCard title="Ауа райы бөлімі" accent="from-emerald-600 to-cyan-600">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <VisualImage
              src="/visuals/weather-ai.svg"
              title="Ауа райы деректері қалай өңделеді?"
              text="Температура, ылғалдылық, жел және қысым бірге талданып, ең ықтимал ауа райы таңдалады."
            />
            <RangeField label="Температура" value={temp} min={-20} max={40} step={1} unit="°C" onChange={setTemp} />
            <RangeField label="Ылғалдылық" value={humidity} min={0} max={100} step={1} unit="%" onChange={setHumidity} />
            <RangeField label="Жел жылдамдығы" value={wind} min={0} max={20} step={1} unit="м/с" onChange={setWind} />
            <RangeField label="Қысым" value={pressure} min={720} max={780} step={1} unit="hPa" onChange={setPressure} />
          </div>
          <div className="space-y-4">
            <WeatherIcon type={weatherData.weather} />
            <Formula>{`Нәтиже: ${weatherData.weather}

Түсіндірме:
Жаңбыр ықтималдығы ылғал жоғары, қысым төмен, жел бар кезде өседі.
Қар температура төмен және ылғал жоғары кезде артады.
Ашық ауа райы ылғал төмен, қысым жоғары кезде ықтимал.`}</Formula>
            <BarChart title="Ауа райы ықтималдығы" data={weatherData.values} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Денсаулық бөлімі" accent="from-rose-600 to-orange-500">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <VisualImage
              src="/visuals/health-ai.svg"
              title="Денсаулық деректері қалай талданады?"
              text="Модель бірнеше көрсеткішті бірге қарап, қалыпты немесе қауіпті жағдайды анықтайды."
            />
            <RangeField label="Дене қызуы" value={bodyTemp} min={35} max={41} step={0.1} unit="°C" onChange={setBodyTemp} />
            <RangeField label="Пульс" value={pulse} min={40} max={140} step={1} unit="bpm" onChange={setPulse} />
            <RangeField label="Қан қысымы" value={bp} min={90} max={180} step={1} unit="mmHg" onChange={setBp} />
            <RangeField label="Глюкоза" value={glucose} min={3} max={12} step={0.1} unit="mmol/L" onChange={setGlucose} />
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center">
              <div className="text-6xl">{health.level === "Қалыпты" ? "🟢" : health.level === "Бақылау қажет" ? "🟡" : "🔴"}</div>
              <div className="mt-3 text-2xl font-black text-slate-900">{health.level}</div>
              <div className="mt-2 text-sm text-slate-600">Қауіп көрсеткіші: {health.risk}%</div>
            </div>
            <BarChart
              title="Көрсеткіштер"
              suffix=""
              data={[
                { label: "Қызу", value: bodyTemp },
                { label: "Пульс", value: pulse },
                { label: "Қысым", value: bp },
                { label: "Глюкоза", value: glucose * 10 },
              ]}
            />
            <SmallInfo
              title="Неге бұлай шешті?"
              text={
                health.reasons.length
                  ? `Қауіп себебі: ${health.reasons.join(", ")}.`
                  : "Барлық көрсеткіштер қалыпты шектерге жақын."
              }
            />
          </div>
        </div>
      </SectionCard>
      <SymptomDiagnosisSimulator />

    </div>
  );
}

function CameraPage() {
  return (
    <SectionCard title="Камера арқылы жаяу жүргіншіні анықтау" accent="from-slate-700 to-slate-900">
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <VisualImage
            src="/visuals/camera-pedestrian-male.svg"
            title="Жаяу жүргіншіні анықтау"
            text="Бұл суретте нейрондық желі жолдағы ер адамды, жаяу жүргінші аймағын және қауіпті аймақты анықтайды."
          />
          <LiveCameraPreview />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AnimatedFlow steps={["Камера", "Кадр", "Ер адам", "Қауіпті аймақ", "Тоқтау"]} />
          <AnimatedSignalChart title="Камера кадрынан шешімге дейінгі сигнал" label="object detection" />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <SmallInfo title="1. Кадр алу" text="Камера нақты уақыттағы суретті кадр ретінде қабылдайды." />
          <SmallInfo title="2. Адамды анықтау" text="Модель кадрдан жаяу жүргінші силуэтін табады." />
          <SmallInfo title="3. Аймақты бағалау" text="Адам жолақта немесе қауіпті аймақта тұр ма, соны салыстырады." />
          <SmallInfo title="4. Шешім" text="Қауіп болса, жүйе тоқтау қажет деген нәтиже шығарады." />
        </div>

        <BarChart
          title="Камера талдауының ықтималдықтары"
          data={[
            { label: "Жаяу жүргінші", value: 98 },
            { label: "Жолақ", value: 91 },
            { label: "Қауіпті аймақ", value: 86 },
            { label: "Тоқтау қажет", value: 94 },
          ]}
        />
      </div>
    </SectionCard>
  );
}

function TrainYourModel() {
  const [samples, setSamples] = useState<Array<{ temp: number; humidity: number; label: string }>>([
    { temp: 18, humidity: 85, label: "Жаңбыр" },
    { temp: 28, humidity: 35, label: "Ашық" },
    { temp: -4, humidity: 78, label: "Қар" },
  ]);
  const [temp, setTemp] = useState(20);
  const [humidity, setHumidity] = useState(70);
  const [label, setLabel] = useState("Жаңбыр");

  const prediction = useMemo(() => {
    if (!samples.length) return "Белгісіз";
    let best = samples[0];
    let bestD = Infinity;
    for (const s of samples) {
      const d = Math.abs(s.temp - temp) + Math.abs(s.humidity - humidity) / 3;
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best.label;
  }, [samples, temp, humidity]);

  const accuracy = clamp(55 + samples.length * 7, 55, 96);

  return (
    <SectionCard title="Модельді өзің үйрет" accent="from-green-600 to-emerald-600">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SmallInfo
            title="Қалай жұмыс істейді?"
            text="Оқушы бірнеше мысал енгізеді. Модель жаңа мәнді бұрынғы мысалдарға ұқсастығы бойынша болжайды."
          />
          <RangeField label="Температура" value={temp} min={-20} max={40} step={1} unit="°C" onChange={setTemp} />
          <RangeField label="Ылғалдылық" value={humidity} min={0} max={100} step={1} unit="%" onChange={setHumidity} />
          <select value={label} onChange={(e) => setLabel(e.target.value)} className="w-full rounded-xl border border-slate-300 p-3">
            <option>Жаңбыр</option>
            <option>Ашық</option>
            <option>Қар</option>
          </select>
          <button
            onClick={() => setSamples([...samples, { temp, humidity, label }])}
            className="rounded-2xl bg-green-600 px-5 py-3 font-bold text-white"
          >
            Мысалды қосу
          </button>
        </div>
        <div className="space-y-4">
          <Formula>{`Модель болжамы: ${prediction}
Оқыту мысалдары: ${samples.length}
Шартты дәлдік: ${accuracy}%`}</Formula>
          <BarChart
            title="Оқыту деректері"
            data={[
              { label: "Мысал саны", value: samples.length * 10 },
              { label: "Дәлдік", value: accuracy },
            ]}
          />
          <div className="max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white p-4">
            {samples.map((s, i) => (
              <div key={i} className="border-b py-2 text-sm last:border-b-0">
                {i + 1}) {s.temp}°C, {s.humidity}% → <b>{s.label}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function OverfittingDemo() {
  const [epoch, setEpoch] = useState(50);
  const trainAcc = clamp(50 + Math.log(epoch + 1) * 12, 55, 99);
  const testAcc = epoch < 120 ? clamp(50 + Math.log(epoch + 1) * 10, 55, 91) : clamp(92 - (epoch - 120) * 0.08, 60, 92);
  const xs = [10, 50, 100, 150, 250, 400, 600];
  const ys = xs.map((e) => (e < 120 ? 50 + Math.log(e + 1) * 10 : 92 - (e - 120) * 0.08));

  return (
    <SectionCard title="Overfitting симуляторы" accent="from-red-600 to-orange-500">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SmallInfo
            title="Overfitting деген не?"
            text="Модель оқыту деректерін қатты жаттап алып, жаңа деректерде нашар нәтиже көрсетсе, бұл overfitting деп аталады."
          />
          <RangeField label="Epoch саны" value={epoch} min={10} max={600} step={10} onChange={setEpoch} />
          <Formula>{`Train accuracy: ${round(trainAcc, 1)}%
Test accuracy: ${round(testAcc, 1)}%

Түсіндірме:
Epoch тым көп болса, модель жаттап алуы мүмкін. Сол кезде train дәлдігі өседі, бірақ test дәлдігі төмендейді.`}</Formula>
        </div>
        <InlineLineChart xValues={xs} yValues={ys} title="Test дәлдігінің өзгеруі" />
      </div>
    </SectionCard>
  );
}

function PracticePage() {
  const practiceCode = `import math

temperature = 18
humidity = 82
wind = 5

z = temperature * 0.03 + humidity * 0.04 + wind * 0.08 - 3
probability = 1 / (1 + math.exp(-z))

print("Жаңбыр ықтималдығы:", round(probability, 3))

if probability > 0.5:
    print("Нәтиже: жаңбыр болуы мүмкін")
else:
    print("Нәтиже: ашық болуы мүмкін")`;

  return (
    <div className="space-y-6">

      <SectionCard title="Тексеру сұрақтары" accent="from-blue-600 to-indigo-600">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Салмақ нейрондық желіде қандай рөл атқарады?",
            "Bias не үшін қажет?",
            "Activation функциясы нәтиже қалай өзгертеді?",
            "Нейрондық желі қалай үйренеді?",
            "Overfitting дегеніміз не және неге қауіпті?",
            "Dataset пен feature ұғымдарының айырмашылығы қандай?",
          ].map((q, i) => (
            <div key={q} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-800">
              {i + 1}. {q}
            </div>
          ))}
        </div>
      </SectionCard>


      <TrainYourModel />
      <OverfittingDemo />

      <SectionCard title="Практикалық Python симуляторы" accent="from-indigo-600 to-violet-600">
        <div className="grid gap-4 lg:grid-cols-2">
          <VisualImage
            src="/visuals/weather-ai.svg"
            title="Мысал: ауа райын болжау"
            text="Python арқылы температура, ылғалдылық және жел бойынша қарапайым нейрон есебі орындалады."
          />
          <PythonRunner defaultCode={practiceCode} title="Нейрондық желіге ұқсас Python есебі" />
        </div>
      </SectionCard>
    </div>
  );
}


function AIToolsPage() {
  return (
    <div className="space-y-6">
      <SectionCard title="Жасанды интеллект құралдары" accent="from-violet-600 to-cyan-600">
        <div className="grid gap-4 lg:grid-cols-2">
          <SmallInfo
            title="1. Мәтін → дыбыс"
            text="Мәтінді енгізіп, браузер арқылы дауыстап оқыту. Бұл Text-to-Speech ұғымын түсіндіреді."
          />
          <SmallInfo
            title="2. Дыбыс → мәтін"
            text="Микрофон арқылы сөйленген сөзді мәтінге айналдыру. Бұл Speech-to-Text жұмысын көрсетеді."
          />
          <SmallInfo
            title="3. Сурет → мәтін"
            text="OCR қалай жұмыс істейтінін көрсететін оқу құралы. Сурет жүктеп, мәтінді тану кезеңдерін көруге болады."
          />
          <SmallInfo
            title="4. Камера → эмоция"
            text="Камерадағы бейнені талдау идеясын түсіндіретін эмоция анықтау симуляторы."
          />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <TextToSpeechTool />
        <SpeechToTextTool />
        <OCRLearningTool />
        <EmotionLearningTool />
      </div>

      <SectionCard title="Бұл құралдар не үшін керек?" accent="from-slate-700 to-slate-900">
        <div className="grid gap-4 md:grid-cols-4">
          <SmallInfo title="TTS" text="Компьютер мәтінді дыбысқа айналдырады." />
          <SmallInfo title="STT" text="Компьютер дыбысты мәтінге айналдырады." />
          <SmallInfo title="OCR" text="Компьютер суреттен әріптерді табады." />
          <SmallInfo title="Emotion AI" text="Компьютер бет-әлпет белгісін талдайды." />
        </div>
      </SectionCard>
    </div>
  );
}

function TextToSpeechTool() {
  const [text, setText] = useState("Сәлем! Бұл нейрондық желілерді үйренуге арналған интерактивті платформа.");
  const [rate, setRate] = useState(0.82);
  const [pitch, setPitch] = useState(0.95);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState("");
  const [status, setStatus] = useState("Мәтінді жазып, «Тыңдау» батырмасын басыңыз.");

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);

      const best =
        available.find((v) => v.lang.toLowerCase().includes("kk")) ||
        available.find((v) => v.lang.toLowerCase().includes("ru")) ||
        available.find((v) => v.lang.toLowerCase().includes("tr")) ||
        available.find((v) => v.lang.toLowerCase().includes("en")) ||
        available[0];

      if (best && !voiceName) setVoiceName(best.name);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [voiceName]);

  const speak = () => {
    if (!("speechSynthesis" in window)) {
      setStatus("Бұл браузер мәтінді дыбысқа айналдыруды қолдамайды.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim() || "Мәтін енгізілмеді.");
    const selectedVoice = voices.find((v) => v.name === voiceName);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = "kk-KZ";
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;

    utterance.onstart = () => setStatus("Оқылып жатыр...");
    utterance.onend = () => setStatus("Оқу аяқталды.");
    utterance.onerror = () => setStatus("Дауыс шығару кезінде қате пайда болды.");

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setStatus("Тоқтатылды.");
  };

  const downloadText = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tts_text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-2xl font-black text-slate-900">🔊 Мәтінді дыбысқа айналдыру</div>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Бұл құрал мәтінді дауыстап оқиды. Дауыс сапасы браузерде орнатылған тілдік дауыстарға байланысты.
          Қазақша дауыс табылмаса, жүйе орысша немесе ағылшынша дауысқа ауысады.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-32 w-full rounded-2xl border border-slate-300 p-4 text-sm leading-6"
        placeholder="Оқылатын мәтінді жазыңыз..."
      />

      <div className="mt-4">
        <div className="mb-1 text-sm font-bold text-slate-700">Дауыс таңдау</div>
        <select
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 p-3 text-sm"
        >
          {voices.length === 0 && <option>Браузер дауыстары жүктелмеді</option>}
          {voices.map((voice) => (
            <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
              {voice.name} — {voice.lang}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <RangeField label="Оқу жылдамдығы" value={rate} min={0.5} max={1.3} step={0.05} onChange={setRate} />
        <RangeField label="Дауыс биіктігі" value={pitch} min={0.6} max={1.4} step={0.05} onChange={setPitch} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={speak} className="rounded-2xl bg-violet-600 px-4 py-2 font-bold text-white hover:bg-violet-700">
          ▶ Тыңдау
        </button>
        <button onClick={stop} className="rounded-2xl bg-slate-700 px-4 py-2 font-bold text-white hover:bg-slate-800">
          ⏹ Тоқтату
        </button>
        <button onClick={downloadText} className="rounded-2xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700">
          ⬇ Мәтінді жүктеу
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
        Ескерту: браузердің SpeechSynthesis дауысы MP3 ретінде тікелей сақталмайды. Дыбысты MP3 етіп жүктеу үшін Google TTS,
        Microsoft Azure немесе ElevenLabs сияқты серверлік API қажет.
      </div>

      <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{status}</div>
      <Formula>{`Text → voice selection → speech synthesis → sound`}</Formula>
    </div>
  );
}


function SpeechToTextTool() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Бұл браузер Speech Recognition API қолдамайды. Chrome браузерін қолданып көріңіз.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "kk-KZ";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = () => {
      setListening(false);
      setTranscript("Микрофонға рұқсат берілмеді немесе тану кезінде қате шықты.");
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-2xl font-black text-slate-900">🎙️ Дыбысты мәтінге айналдыру</div>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Бұл құрал микрофоннан дыбыс қабылдап, оны мәтін ретінде көрсетуге тырысады.
          Бұл сөйлеуді тану жүйелерінің қарапайым демонстрациясы.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={startListening}
          disabled={listening}
          className="rounded-2xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          🎤 Бастау
        </button>
        <button onClick={stopListening} className="rounded-2xl bg-slate-700 px-4 py-2 font-bold text-white hover:bg-slate-800">
          ⏹ Тоқтату
        </button>
      </div>

      <div className="mt-4 min-h-40 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-800">
        {transcript || "Микрофонды қосып, сөйлеңіз. Танылған мәтін осында шығады."}
      </div>

      <Formula>{`Sound → spectrogram → speech model → text`}</Formula>
    </div>
  );
}

function OCRLearningTool() {
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("Сурет жүктелмеді");
  const [recognizedText, setRecognizedText] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const loadTesseract = () => {
    return new Promise<any>((resolve, reject) => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      script.async = true;
      script.onload = () => resolve(window.Tesseract);
      script.onerror = () => reject(new Error("Tesseract кітапханасы жүктелмеді"));
      document.body.appendChild(script);
    });
  };

  const uploadImage = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStatus("Сурет жүктелді. «Мәтінді тану» батырмасын басыңыз.");
    setRecognizedText("");
  };

  const recognize = async () => {
    if (!imageUrl) {
      setStatus("Алдымен сурет жүктеңіз.");
      return;
    }

    try {
      setIsRecognizing(true);
      setStatus("OCR кітапханасы жүктеліп жатыр...");
      const Tesseract = await loadTesseract();

      setStatus("Мәтін танылып жатыр. Бұл бірнеше секунд алуы мүмкін...");
      const result = await Tesseract.recognize(imageUrl, "eng+rus", {
        logger: (m: any) => {
          if (m.status) setStatus(`OCR: ${m.status} ${m.progress ? Math.round(m.progress * 100) + "%" : ""}`);
        },
      });

      const text = result?.data?.text?.trim() || "Мәтін анықталмады.";
      setRecognizedText(text);
      setStatus("OCR аяқталды.");
    } catch {
      setStatus("OCR іске қосылмады. Интернетті тексеріңіз немесе басқа сурет жүктеп көріңіз.");
    } finally {
      setIsRecognizing(false);
    }
  };

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-2xl font-black text-slate-900">🖼️ Суреттен мәтін шығару</div>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          OCR жүйесі суреттегі әріптерді тауып, оларды мәтінге айналдырады. Бұл бөлімде сурет жүктеп, мәтінді нақты тануға болады.
        </p>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => uploadImage(e.target.files?.[0])}
        className="w-full rounded-2xl border border-slate-300 p-3 text-sm"
      />

      {imageUrl && (
        <img
          ref={imageRef}
          src={imageUrl}
          alt="OCR үшін жүктелген сурет"
          className="mt-4 max-h-64 w-full rounded-2xl border border-slate-200 object-contain"
        />
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={recognize}
          disabled={isRecognizing}
          className="rounded-2xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          🔍 Мәтінді тану
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">{status}</div>

      <textarea
        value={recognizedText}
        onChange={(e) => setRecognizedText(e.target.value)}
        className="mt-4 min-h-32 w-full rounded-2xl border border-slate-300 p-4 text-sm leading-6"
        placeholder="Танылған мәтін осында шығады..."
      />

      <Formula>{`Image → preprocessing → character detection → recognized text`}</Formula>
    </div>
  );
}


function EmotionLearningTool() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState("Модель жүктеліп жатыр...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [scores, setScores] = useState({
    happy: 0,
    neutral: 0,
    surprised: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
  });

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus("Face API модельдері жүктеліп жатыр...");
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        setModelsLoaded(true);
        setStatus("Модель дайын. Камераны қосыңыз немесе сурет жүктеңіз.");
      } catch (error) {
        setStatus("Модельдер жүктелмеді. public/models папкасындағы файл атауларын тексеріңіз.");
      }
    };

    loadModels();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const emotionMap: Record<string, { label: string; emoji: string }> = {
    happy: { label: "ҚУАНЫШ", emoji: "😀" },
    neutral: { label: "БЕЙТАРАП", emoji: "😐" },
    surprised: { label: "ТАҢҒАЛУ", emoji: "😲" },
    sad: { label: "МҰҢ", emoji: "😢" },
    angry: { label: "АШУ", emoji: "😠" },
    fearful: { label: "ҚОРҚЫНЫШ", emoji: "😨" },
    disgusted: { label: "ЖИІРКЕНУ", emoji: "🤢" },
  };

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0] || ["neutral", 0];
  const bestInfo = emotionMap[best[0]] || emotionMap.neutral;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus("Камера қосылды. «Эмоцияны анықтау» батырмасын басыңыз.");
    } catch {
      setStatus("Камераға рұқсат берілмеді. Браузерден камера рұқсатын қосыңыз.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) videoRef.current.srcObject = null;

    const overlay = overlayRef.current;
    const ctx = overlay?.getContext("2d");
    if (overlay && ctx) ctx.clearRect(0, 0, overlay.width, overlay.height);

    setDetecting(false);
    setStatus("Камера тоқтатылды.");
  };

  const drawLabelOnOverlay = (
    box: { x: number; y: number; width: number; height: number },
    emotionKey: string,
    confidence: number
  ) => {
    const overlay = overlayRef.current;
    const video = videoRef.current;
    if (!overlay || !video) return;

    const rect = video.getBoundingClientRect();
    overlay.width = rect.width;
    overlay.height = rect.height;

    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const scaleX = overlay.width / video.videoWidth;
    const scaleY = overlay.height / video.videoHeight;

    const x = box.x * scaleX;
    const y = box.y * scaleY;
    const w = box.width * scaleX;
    const h = box.height * scaleY;

    const info = emotionMap[emotionKey] || emotionMap.neutral;
    const label = `${info.emoji} ${info.label} ${Math.round(confidence * 100)}%`;

    ctx.strokeStyle = "#14b8a6";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);

    const labelY = Math.max(10, y - 48);
    ctx.fillStyle = "rgba(15, 23, 42, 0.86)";
    ctx.roundRect(x, labelY, Math.max(190, label.length * 12), 40, 14);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText(label, x + 12, labelY + 27);
  };

  const detectFromVideo = async () => {
    if (!modelsLoaded) {
      setStatus("Модель әлі жүктелмеді.");
      return;
    }

    if (!videoRef.current) return;

    setDetecting(true);
    setStatus("Эмоция анықталып жатыр...");

    const result = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 }))
      .withFaceExpressions();

    if (!result) {
      setStatus("Бет анықталмады. Камераға жақынырақ қараңыз немесе жарықты көбейтіңіз.");
      setDetecting(false);
      return;
    }

    const expressions = result.expressions as Record<string, number>;
    const normalized = {
      happy: Math.round((expressions.happy || 0) * 100),
      neutral: Math.round((expressions.neutral || 0) * 100),
      surprised: Math.round((expressions.surprised || 0) * 100),
      sad: Math.round((expressions.sad || 0) * 100),
      angry: Math.round((expressions.angry || 0) * 100),
      fearful: Math.round((expressions.fearful || 0) * 100),
      disgusted: Math.round((expressions.disgusted || 0) * 100),
    };

    setScores(normalized);

    const bestEmotion = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0];
    drawLabelOnOverlay(result.detection.box, bestEmotion[0], bestEmotion[1]);

    const info = emotionMap[bestEmotion[0]] || emotionMap.neutral;
    setStatus(`${info.emoji} ${info.label} анықталды: ${Math.round(bestEmotion[1] * 100)}%`);
    setDetecting(false);
  };

  const uploadImage = async (file: File | undefined) => {
    if (!file) return;

    if (!modelsLoaded) {
      setStatus("Модель әлі жүктелмеді.");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = new Image();

    img.onload = async () => {
      canvas.width = 640;
      canvas.height = 360;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);

      setStatus("Сурет жүктелді. Эмоция анықталып жатыр...");

      const result = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 }))
        .withFaceExpressions();

      if (!result) {
        setStatus("Суреттен бет анықталмады. Беті анық көрінетін сурет таңдаңыз.");
        return;
      }

      const expressions = result.expressions as Record<string, number>;
      const normalized = {
        happy: Math.round((expressions.happy || 0) * 100),
        neutral: Math.round((expressions.neutral || 0) * 100),
        surprised: Math.round((expressions.surprised || 0) * 100),
        sad: Math.round((expressions.sad || 0) * 100),
        angry: Math.round((expressions.angry || 0) * 100),
        fearful: Math.round((expressions.fearful || 0) * 100),
        disgusted: Math.round((expressions.disgusted || 0) * 100),
      };

      setScores(normalized);

      const bestEmotion = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0];
      const info = emotionMap[bestEmotion[0]] || emotionMap.neutral;

      ctx.strokeStyle = "#14b8a6";
      ctx.lineWidth = 4;
      ctx.strokeRect(result.detection.box.x, result.detection.box.y, result.detection.box.width, result.detection.box.height);

      ctx.fillStyle = "rgba(15, 23, 42, 0.86)";
      ctx.roundRect(result.detection.box.x, Math.max(10, result.detection.box.y - 48), 230, 40, 14);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.fillText(`${info.emoji} ${info.label} ${Math.round(bestEmotion[1] * 100)}%`, result.detection.box.x + 12, Math.max(37, result.detection.box.y - 21));

      setStatus(`${info.emoji} ${info.label} анықталды: ${Math.round(bestEmotion[1] * 100)}%`);
    };

    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-2xl font-black text-slate-900">😀 Нақты эмоция тану</div>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Бұл бөлім face-api.js моделін пайдаланып, камерадан немесе жүктелген суреттен адамның эмоциясын анықтайды.
          Нәтиже адамның бетінің үстіне жазылып шығады.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
        <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted />
        <canvas ref={overlayRef} className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute right-4 top-4 rounded-2xl bg-slate-950/80 px-4 py-3 text-white shadow-lg">
          <div className="text-2xl font-black">{bestInfo.emoji} {bestInfo.label}</div>
          <div className="text-sm text-slate-300">Сенімділік: {Math.round(best[1])}%</div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => uploadImage(e.target.files?.[0])}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={startCamera} className="rounded-2xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800">
          📷 Камераны қосу
        </button>
        <button
          onClick={detectFromVideo}
          disabled={!modelsLoaded || detecting}
          className="rounded-2xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          😀 Эмоцияны анықтау
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="rounded-2xl bg-violet-600 px-4 py-2 font-bold text-white hover:bg-violet-700">
          ⬆ Сурет жүктеу
        </button>
        <button onClick={stopCamera} className="rounded-2xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700">
          ⏹ Тоқтату
        </button>
      </div>

      <canvas ref={canvasRef} className="mt-4 aspect-video w-full rounded-2xl border border-slate-200 bg-white" />

      <BarChart
        title="Эмоция ықтималдықтары"
        data={[
          { label: "Қуаныш", value: scores.happy },
          { label: "Бейтарап", value: scores.neutral },
          { label: "Таңғалу", value: scores.surprised },
          { label: "Мұң", value: scores.sad },
          { label: "Ашу", value: scores.angry },
          { label: "Қорқыныш", value: scores.fearful },
          { label: "Жиіркену", value: scores.disgusted },
        ]}
      />

      <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
        Ескерту: бұл оқу мақсатындағы AI құрал. Нәтиже жарық, камера сапасы және бет көрінуіне байланысты өзгеруі мүмкін.
      </div>

      <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{status}</div>
    </div>
  );
}


export default function Page() {
  const [menu, setMenu] = useState<MenuKey>("home");

  useEffect(() => {
    try {
      const savedMenu = localStorage.getItem("nn_last_menu");
      if (savedMenu) setMenu(savedMenu as MenuKey);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("nn_last_menu", menu);
    } catch {}
  }, [menu]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 text-slate-900">
      <Navbar current={menu} onChange={setMenu} />

      <main id="main-content" className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
        {menu === "home" && <HomePage onStart={setMenu} />}
        {menu === "theory" && <TheoryPage />}
        {menu === "flow" && <FlowPage />}
        {menu === "method" && <MethodPage />}
        {menu === "neuron" && <NeuronPage />}
        {menu === "image" && <ImagePage />}
        {menu === "digit" && <DigitPage />}
        {menu === "sound" && <SoundPage />}
        {menu === "sensors" && <SensorsPage />}
        {menu === "camera" && <CameraPage />}
        {menu === "aiTools" && <AIToolsPage />}
        {menu === "practice" && <PracticePage />}
      </main>
    </div>
  );
}
