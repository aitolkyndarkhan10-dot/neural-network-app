"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

declare global {
  interface Window {
    loadPyodide?: (opts?: { indexURL?: string }) => Promise<any>;
    pyodideInstance?: any;
  }
}

type MenuKey =
  | "home"
  | "theory"
  | "method"
  | "neuron"
    | "image"
  | "sound"
  | "sensors"
  | "camera"
  | "practice";

type MethodTopic = {
  title: string;
  explain: string;
  formula: string;
  how: string;
  example: string;
  task1: string;
  task2: string;
  code: string;
  outputType: "graph" | "image" | "audio" | "table" | "camera";
  graphTitle?: string;
  video?: string;
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

const methodTopics: MethodTopic[] = [
  {
    title: "1. Нейрондық желіні оқыту негіздері",
    explain:
      "Нейрондық желі кіріс деректерін өңдеп, салмақтар арқылы нәтиже шығарады. Бұл бөлімде нейронның шығысы x өзгергенде қалай өзгеретінін графиктен көресіз.",
    formula: "z = wx + b,   y = sigmoid(z)",
    how: "Кіріс x салмақ w-пен көбейтіледі, bias b қосылады, содан кейін sigmoid функциясы қолданылады.",
    example: "x=2, w=0.5, b=1 → z=2, y=sigmoid(2)",
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
    title: "2. Python және нейрондық желіге қажет орталарды орнату",
    explain:
      "Нейрондық желімен жұмыс істеуде Python, NumPy, Matplotlib, scikit-learn, TensorFlow және OpenCV кітапханалары жиі қолданылады.",
    formula: "pip install numpy",
    how: "Компьютерге кітапхана орнату үшін терминалда pip install командасы қолданылады.",
    example: "pip install matplotlib",
    task1: "Тізімге тағы 2 кітапхана қосыңыз.",
    task2: "Қай кітапхана суретке, қайсысы графикке, қайсысы модельге керегін жазыңыз.",
    outputType: "table",
    video: "https://www.youtube.com/embed/rfscVS0vtbw",
    code: `libs = [
    ["python", "негізгі тіл"],
    ["numpy", "сандық есептеулер"],
    ["matplotlib", "график салу"],
    ["scikit-learn", "машиналық оқыту"],
    ["tensorflow", "нейрондық желі"],
    ["opencv-python", "сурет өңдеу"]
]

for i, item in enumerate(libs, start=1):
    print(i, "-", item[0], "-", item[1])`,
  },
  {
    title: "3. Перцептронның салмақталған қосындысын есептеу",
    explain:
      "Перцептронның негізгі қадамы — кіріс мәндерін салмақтап қосу. Бұл бөлімде әр бөліктің үлесін көресіз.",
    formula: "z = w₁x₁ + w₂x₂ + b",
    how: "Әр кіріс өз салмағына көбейтіледі. Соңында bias қосылады.",
    example: "x1=0.7, x2=0.4, w1=0.6, w2=0.5, b=0.1",
    task1: "x1 мен x2-ні ауыстырып көріңіз.",
    task2: "w1, w2, b мәндерін өзгертіп салыстырыңыз.",
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
    title: "4. Sigmoid және ReLU функцияларын салыстыру",
    explain:
      "Sigmoid нәтижені 0 мен 1 аралығына келтіреді, ал ReLU теріс мәндерді 0 қылып, оң мәндерді өткізеді.",
    formula: "sigmoid(x)=1/(1+e^-x), ReLU(x)=max(0,x)",
    how: "Бірдей x мәндері үшін екі функцияның нәтижесін есептейміз.",
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
    title: "5. MSE қате функциясын есептеу",
    explain:
      "MSE — модельдің орташа квадрат қатесі. Қате аз болған сайын модель жақсырақ.",
    formula: "MSE = (1/n) Σ(y_true - y_pred)²",
    how: "Нақты және болжам мәндерінің айырмасын квадраттап, орташа аламыз.",
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
    title: "6. Градиенттік түсудің бір қадамы",
    explain:
      "Градиенттік түсу модель параметрлерін қателікті азайтатын бағытқа жаңартады.",
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
    title: "7. NumPy көмегімен бір жасырын қабатты желі құру",
    explain:
      "Жасырын қабат кіріс белгілерін өңдеп, шығысқа пайдалы ақпарат береді. Бұл көпқабатты желінің қарапайым логикасы.",
    formula: "Hidden = f(Wx+b), Output = f(Wh+b)",
    how: "Кіріс мәндері жасырын қабатқа өтеді, кейін шығыс есептеледі.",
    example: "2 кіріс, 2 жасырын нейрон, 1 шығыс",
    task1: "Bias мәнін өзгертіңіз.",
    task2: "Жасырын нейрон санын көбейтудің мәнін түсіндіріңіз.",
    outputType: "table",
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
    title: "8. Iris деректер жиынын жүктеу және қарау",
    explain:
      "Iris — классификацияға арналған танымал деректер жиыны. Онда үш түрлі гүл класы бар.",
    formula: "Объект = белгілер + класс",
    how: "Әр жол бір гүлді сипаттайды.",
    example: "setosa, versicolor, virginica",
    task1: "Тағы 2 жол қосыңыз.",
    task2: "Қай класс қанша рет кездесетінін санаңыз.",
    outputType: "table",
    video: "https://www.youtube.com/embed/0Lt9w-BxKFQ",
    code: `iris = [
    ["setosa", 5.1, 3.5],
    ["versicolor", 7.0, 3.2],
    ["virginica", 6.3, 3.3]
]

for row in iris:
    print(row)`,
  },
  {
    title: "9. Iris деректерін нүктелік диаграммада бейнелеу",
    explain:
      "Нүктелік диаграмма деректердің таралуын көрсетеді. Бұл кластар арасындағы айырманы көруге көмектеседі.",
    formula: "x — бірінші белгі, y — екінші белгі",
    how: "Әр нүкте бір объектіні білдіреді.",
    example: "(1,1), (2,4), (3,9)",
    task1: "Тағы 3 нүкте қосыңыз.",
    task2: "Қай нүктелер жоғары орналасқанын түсіндіріңіз.",
    outputType: "graph",
    graphTitle: "Нүктелердің таралуы",
    video: "https://www.youtube.com/embed/GPVsHOlRBBI",
    code: `points = [(1, 1), (2, 4), (3, 9), (4, 16), (5, 25)]

for x, y in points:
    x_values.append(x)
    y_values.append(y)
    print("x =", x, "y =", y)`,
  },
  {
    title: "10. MLPClassifier арқылы Iris классификациясы",
    explain:
      "MLPClassifier — көпқабатты перцептронға негізделген классификатор. Ол ең ықтимал класты таңдайды.",
    formula: "Класс = argmax ықтималдық",
    how: "Әр классқа ықтималдық беріледі, ең үлкені таңдалады.",
    example: "setosa — 0.95",
    task1: "Ықтималдықтарды өзгертіңіз.",
    task2: "Неге үлкен ықтималдық таңдалатынын түсіндіріңіз.",
    outputType: "table",
    video: "https://www.youtube.com/embed/KNAWp2S3w94",
    code: `samples = [
    ("setosa", 0.95),
    ("versicolor", 0.72),
    ("virginica", 0.88)
]

for name, prob in samples:
    print("Класс:", name, "| ықтималдық:", prob)`,
  },
  {
    title: "11. Қателер матрицасын құру (Confusion Matrix)",
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

for row in cm:
    print(row)`,
  },
  {
    title: "12. Суретті жүктеу және сұр түске ауыстыру",
    explain:
      "Суретті сұр түске айналдыру — image processing-тегі негізгі қадамдардың бірі.",
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
    title: "13. Жиектерді анықтау",
    explain:
      "Жиек — көрші пиксельдер арасындағы үлкен айырмашылық. Бұл суреттегі объект шекарасын табуға көмектеседі.",
    formula: "diff = |p(i+1)-p(i)|",
    how: "Көрші пиксельдердің айырмасы есептеледі.",
    example: "10,20,100,120",
    task1: "Пиксель тізімін өзгертіңіз.",
    task2: "Қай жерде жиек күшті екенін табыңыз.",
    outputType: "image",
    video: "https://www.youtube.com/embed/sARklx6sgDk",
    code: `pixels = [10, 20, 100, 120, 180]

for i in range(len(pixels) - 1):
    diff = abs(pixels[i+1] - pixels[i])
    print("Айырма", i+1, "=", diff)`,
  },
  {
    title: "14. MNIST цифрларын жүктеу",
    explain:
      "MNIST — қолжазба цифрларды тануға арналған классикалық деректер жиыны.",
    formula: "Класс = 0...9",
    how: "Әр сурет бір цифрға сәйкес келеді.",
    example: "0,1,2,...,9",
    task1: "Цифрларды кері шығарыңыз.",
    task2: "Жұп және тақ цифрларды бөліңіз.",
    outputType: "image",
    video: "https://www.youtube.com/embed/aircAruvnKk",
    code: `digits = list(range(10))

for d in digits:
    print("Цифр:", d)`,
  },
  {
    title: "15. Қарапайым CNN құру",
    explain:
      "CNN суреттегі ерекшелік белгілерін сүзгілер арқылы шығарады және соңында класс анықтайды.",
    formula: "Conv → ReLU → Pooling → Dense",
    how: "Алдымен ерекшелік карталары алынады, кейін классификация жасалады.",
    example: "Conv, Pooling, Dense",
    task1: "Қабаттар ретін өзгертіп көріңіз.",
    task2: "Dense қабатының рөлін түсіндіріңіз.",
    outputType: "image",
    video: "https://www.youtube.com/embed/YRhxdVk_sIs",
    code: `layers = ["Conv", "ReLU", "Pooling", "Flatten", "Dense"]

for i, layer in enumerate(layers, start=1):
    print(i, "-", layer)`,
  },
  {
    title: "16. Data augmentation қолдану",
    explain:
      "Data augmentation суреттерді бұру, аудару, кесу сияқты тәсілдермен деректер санын көбейтеді.",
    formula: "augmented_data = transform(image)",
    how: "Бір суреттен бірнеше өзгертілген сурет жасалады.",
    example: "rotate, flip, crop",
    task1: "Тағы бір augmentation әдісін қосыңыз.",
    task2: "Қай әдіс қай есепке пайдалы екенін жазыңыз.",
    outputType: "image",
    video: "https://www.youtube.com/embed/Pqm0KJINK8o",
    code: `ops = ["rotate", "flip", "crop", "brightness"]

for op in ops:
    print(op)`,
  },
  {
    title: "17. Веб-камерадан кадр оқу",
    explain:
      "Камерадан келетін әр кадр — сурет. Бұл object detection пен real-time vision үшін маңызды.",
    formula: "Frame = камерадан алынған сурет",
    how: "Әр кадр сурет ретінде өңделеді.",
    example: "Кадр 1, 2, 3",
    task1: "Камерадан кадр түсіріп көріңіз.",
    task2: "Сұр түске ауыстырып сақтап көріңіз.",
    outputType: "camera",
    video: "https://www.youtube.com/embed/01sAkU_NvOY",
    code: `frames = [1, 2, 3, 4, 5]

for f in frames:
    print("Кадр №", f)`,
  },
  {
    title: "18. Transfer learning: MobileNetV2 негізінде сурет классификациясы",
    explain:
      "Transfer learning — дайын модельді жаңа есепке бейімдеу. Бұл уақытты үнемдейді.",
    formula: "New model = pretrained model + new head",
    how: "Дайын модельдің негізгі қабаттары сақталып, соңғы бөлігі жаңа есепке бейімделеді.",
    example: "MobileNetV2 + cat/dog classifier",
    task1: "Тағы бір pretrained model атауын жазыңыз.",
    task2: "Transfer learning неге тиімді екенін түсіндіріңіз.",
    outputType: "image",
    video: "https://www.youtube.com/embed/yofjFQddwHE",
    code: `steps = ["pretrained model", "new data", "fine-tuning", "prediction"]

for step in steps:
    print(step)`,
  },
  {
    title: "19. Дыбыс файлын оқу және дауысты мәтінге айналдыру",
    explain:
      "Speech-to-text жүйелері дыбысты мәтінге айналдырады. Бұл бөлімде дыбыс толқыны мен қарапайым аудио үлгісі көрсетіледі.",
    formula: "Audio → Features → Text",
    how: "Алдымен дыбыс алынады, кейін белгілер өңделеді, соңында мәтін құрылады.",
    example: "дыбысты оқу → талдау → мәтінге айналдыру",
    task1: "Дыбыс қадамдарын ретімен жазыңыз.",
    task2: "Неге дыбысты алдын ала өңдеу керек екенін түсіндіріңіз.",
    outputType: "audio",
    video: "https://www.youtube.com/embed/LFXXTgc85ew",
    code: `steps = ["дыбысты оқу", "сигналды талдау", "мәтінге түрлендіру"]

for step in steps:
    print(step)`,
  },
  {
    title: "20. Медицинадағы кестелік деректер: диабет қаупін бағалау",
    explain:
      "Кестелік деректер арқылы денсаулық көрсеткіштерін талдап, қауіп деңгейін бағалауға болады.",
    formula: "Егер белгі шектен асса → қауіп жоғары",
    how: "Мысалы, глюкоза нормадан жоғары болса қауіп артады.",
    example: "glucose > 7",
    task1: "Глюкоза мәнін өзгертіңіз.",
    task2: "Тағы бір медициналық көрсеткіш ойлап қосыңыз.",
    outputType: "table",
    video: "https://www.youtube.com/embed/0Lt9w-BxKFQ",
    code: `glucose_values = [4.8, 5.2, 6.1, 7.0, 8.4]

for g in glucose_values:
    status = "қауіп жоғары" if g > 7 else "қауіп төмен"
    print(g, status)`,
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
  const { data: session } = useSession();

  const items: Array<{ key: MenuKey | "admin"; label: string }> = [
    { key: "home", label: "Басты бет" },
    { key: "theory", label: "Теориялық бөлім" },
    { key: "method", label: "Әдістемелік бөлім" },
    { key: "neuron", label: "Бір нейрон" },
    { key: "image", label: "Сурет" },
    { key: "sound", label: "Дыбыс" },
    { key: "sensors", label: "Ауа райы / Денсаулық" },
    { key: "camera", label: "Камера" },
    { key: "practice", label: "Практика" },
  ];

  if (session?.user?.email === "aitolkyndarkhan10@gmail.com") {
    items.push({ key: "admin", label: "Админ" });
  }

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3">
        {items.map((item) => {
          const isAdmin = item.key === "admin";
          const isActive = !isAdmin && current === item.key;

          return (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === "admin") {
                  window.location.href = "/admin";
                } else {
                  onChange(item.key as MenuKey);
                }
              }}
              className={
                isAdmin
                  ? "rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
                  : isActive
                  ? "rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition"
                  : "rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              }
            >
              {item.label}
            </button>
          );
        })}
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

  const ticksX = 6;
  const ticksY = 5;

  return (
    <div className="space-y-3">
      <div className="font-semibold text-slate-800">{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-3xl border border-slate-200 bg-white">
        <rect x="0" y="0" width={width} height={height} fill="white" />

        {[...Array(ticksY + 1)].map((_, i) => {
          const y = pad + ((height - pad * 2) / ticksY) * i;
          return <line key={`gy-${i}`} x1={pad} y1={y} x2={width - pad} y2={y} stroke="#e2e8f0" />;
        })}

        {[...Array(ticksX + 1)].map((_, i) => {
          const x = pad + ((width - pad * 2) / ticksX) * i;
          return <line key={`gx-${i}`} x1={x} y1={pad} x2={x} y2={height - pad} stroke="#e2e8f0" />;
        })}

        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#334155" strokeWidth="2" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#334155" strokeWidth="2" />

        <path d={path} fill="none" stroke="#2563eb" strokeWidth="4" />

        {[...Array(ticksX + 1)].map((_, i) => {
          const x = pad + ((width - pad * 2) / ticksX) * i;
          const value = minX + ((maxX - minX) / ticksX) * i;
          return (
            <text key={`tx-${i}`} x={x} y={height - 16} textAnchor="middle" fontSize="12" fill="#334155">
              {Number(value.toFixed(1))}
            </text>
          );
        })}

        {[...Array(ticksY + 1)].map((_, i) => {
          const y = height - pad - ((height - pad * 2) / ticksY) * i;
          const value = minY + ((maxY - minY) / ticksY) * i;
          return (
            <text key={`ty-${i}`} x={20} y={y + 4} textAnchor="start" fontSize="12" fill="#334155">
              {Number(value.toFixed(2))}
            </text>
          );
        })}

        <text x={width / 2} y={height - 4} textAnchor="middle" fontSize="13" fill="#0f172a">
          x
        </text>
        <text x={18} y={20} textAnchor="middle" fontSize="13" fill="#0f172a">
          y
        </text>
      </svg>
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

function TopicOutput({
  outputType,
  title,
}: {
  outputType: "graph" | "image" | "audio" | "table" | "camera";
  title: string;
}) {
  if (outputType === "image") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="font-bold text-slate-800">Тақырыпқа сай визуалды нәтиже</div>

        {title.includes("сұр түске") && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-3">
              <div className="mb-2 font-semibold">RGB үлгісі</div>
              <div className="h-32 rounded-lg" style={{ background: "rgb(120,180,70)" }} />
            </div>
            <div className="rounded-xl border p-3">
              <div className="mb-2 font-semibold">Gray үлгісі</div>
              <div className="h-32 rounded-lg bg-gray-400" />
            </div>
          </div>
        )}

        {title.includes("Жиектерді") && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-3">
              <div className="mb-2 font-semibold">Бастапқы сурет</div>
              <div className="flex h-32 items-center justify-center rounded-lg bg-slate-200 text-xl">⬛⬜⬛</div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="mb-2 font-semibold">Жиек нәтижесі</div>
              <div className="flex h-32 items-center justify-center rounded-lg bg-white text-3xl">▌ ▌ ▌</div>
            </div>
          </div>
        )}

        {title.includes("MNIST") && (
          <div className="grid gap-4 md:grid-cols-5">
            {[0, 1, 2, 3, 8].map((n) => (
              <div key={n} className="rounded-xl border p-3 text-center">
                <div className="mb-2 font-semibold">Цифр {n}</div>
                <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100 text-5xl font-bold">
                  {n}
                </div>
              </div>
            ))}
          </div>
        )}

        {title.includes("CNN") && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border p-3 text-center">
              <div className="mb-2 font-semibold">Кіріс сурет</div>
              <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100">🖼️</div>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <div className="mb-2 font-semibold">Сүзгі нәтижесі</div>
              <div className="flex h-24 items-center justify-center rounded-lg bg-slate-200">▒▒▒</div>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <div className="mb-2 font-semibold">Класс</div>
              <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100">Cat / Dog</div>
            </div>
          </div>
        )}

        {title.includes("Data augmentation") && (
          <div className="grid gap-4 md:grid-cols-4">
            {["Бастапқы", "Rotate", "Flip", "Crop"].map((name) => (
              <div key={name} className="rounded-xl border p-3 text-center">
                <div className="mb-2 font-semibold">{name}</div>
                <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100">🖼️</div>
              </div>
            ))}
          </div>
        )}

        {title.includes("Transfer learning") && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border p-3 text-center">
              <div className="mb-2 font-semibold">Кіріс сурет</div>
              <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100">🐱</div>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <div className="mb-2 font-semibold">Дайын модель</div>
              <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100">MobileNetV2</div>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <div className="mb-2 font-semibold">Нәтиже</div>
              <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100">Мысық</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (outputType === "audio") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 font-bold text-slate-800">Тақырыпқа сай дыбыстық нәтиже</div>
        <div className="rounded-xl border p-4">
          <div className="mb-2 font-semibold">Дыбыс толқынының үлгісі</div>
          <div className="relative h-24 rounded-lg bg-slate-100">
            <svg viewBox="0 0 600 100" className="h-full w-full">
              <path
                d="M0 50 Q 25 20 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50 T 350 50 T 400 50 T 450 50 T 500 50 T 550 50 T 600 50"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="mt-3">
            <audio controls className="w-full">
              <source
                src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
                type="audio/wav"
              />
            </audio>
          </div>
        </div>
      </div>
    );
  }

  if (outputType === "table") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 font-bold text-slate-800">Тақырыпқа сай кестелік нәтиже</div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-3 py-2">№</th>
                <th className="border border-slate-300 px-3 py-2">Мән</th>
                <th className="border border-slate-300 px-3 py-2">Түсіндірме</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2">1</td>
                <td className="border px-3 py-2">0.95</td>
                <td className="border px-3 py-2">Жоғары ықтималдық</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">2</td>
                <td className="border px-3 py-2">0.72</td>
                <td className="border px-3 py-2">Орташа ықтималдық</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">3</td>
                <td className="border px-3 py-2">0.88</td>
                <td className="border px-3 py-2">Жоғары нәтиже</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (outputType === "camera") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 font-bold text-slate-800">Тақырыпқа сай камералық нәтиже</div>
        <div className="rounded-xl border p-3 text-center">
          <div className="mb-2 font-semibold">Камера кадры үлгісі</div>
          <div className="flex h-40 items-center justify-center rounded-lg bg-slate-900 text-white">
            Live Frame Preview
          </div>
        </div>
      </div>
    );
  }

  return null;
}

 function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-10">
      <section className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Жасанды интеллект • Машиналық оқыту • Нейрондық желі
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            Нейрондық желілерді оқыту платформасы
          </h1>

          <p className="text-lg leading-8 text-slate-700">
            Бұл сайт нейрондық желі тақырыбын түсіндіруге арналған. Мұнда теориялық бөлім,
            әдістемелік нұсқаулық, Python арқылы тәжірибе, сурет, дыбыс, камера,
            ауа райы мен денсаулық бөлімдері бар.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {!session?.user ? (
              <a
                href="/login"
                className="inline-flex rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Тіркелу / Кіру
              </a>
            ) : (
              <>
                <div className="inline-flex rounded-2xl bg-emerald-100 px-5 py-3 font-semibold text-emerald-800">
                  Қош келдіңіз, {session.user.name || session.user.email}
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex rounded-2xl bg-slate-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-300"
                >
                  Шығу
                </button>
              </>
            )}

            <a
              href="/profile"
              className="inline-flex rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Жеке кабинет
            </a>
          </div>

          {!session?.user && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Сабақ бөлімдерінің атаулары көрінеді, бірақ мазмұны тіркелгеннен кейін ғана ашылады.
            </div>
          )}
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
    </div>
  );
}

function TheoryPage() {
  return (
    <div className="space-y-6">
      <SectionCard title="Теориялық негіздер" accent="from-blue-600 to-indigo-600">
        <div className="grid gap-4 lg:grid-cols-2">
          <SmallInfo
            title="Нейрондық желі дегеніміз не?"
            text="Нейрондық желі — кіріс деректерін өңдеп, заңдылықтарды үйреніп, нәтижені болжайтын математикалық модель. Оның жұмысы адамның миындағы нейрондардың байланысына ұқсас."
          />
          <SmallInfo
            title="Қолданылуы"
            text="Нейрондық желілер сурет тану, мәтін өңдеу, дыбыс тану, медицина, қаржы, робототехника, қауіпсіздік және білім беруде қолданылады."
          />
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

      <SectionCard title="Activation функциялары" accent="from-cyan-600 to-sky-600">
        <div className="grid gap-4 md:grid-cols-3">
          <SmallInfo title="Sigmoid" text="Sigmoid функциясы нәтижені 0 мен 1 аралығына келтіреді." />
          <SmallInfo title="ReLU" text="ReLU функциясы f(x)=max(0,x). Теріс мәндерді 0 қылады." />
          <SmallInfo title="Tanh" text="Tanh функциясы нәтижені -1 мен 1 аралығында береді." />
        </div>
      </SectionCard>

      <SectionCard title="Нейрондық желі туралы видео" accent="from-rose-600 to-orange-500">
        <div className="aspect-video overflow-hidden rounded-3xl border border-slate-200 bg-black">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/aircAruvnKk"
            title="Нейрондық желі"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
            <SmallInfo title="Түсіндірме" text={topic.explain} />
            <Formula>{topic.formula}</Formula>
            <SmallInfo title="Қалай орындалады?" text={topic.how} />
            <SmallInfo title="Мысал" text={topic.example} />
            {topic.video && (
              <div className="aspect-video overflow-hidden rounded-3xl border border-slate-200 bg-black">
                <iframe className="h-full w-full" src={topic.video} title={topic.title} allowFullScreen />
              </div>
            )}
            <SmallInfo title="Тапсырма 1" text={topic.task1} />
            <SmallInfo title="Тапсырма 2" text={topic.task2} />
            <TopicOutput outputType={topic.outputType} title={topic.title} />
            <PythonRunner
              defaultCode={topic.code}
              title={`${topic.title} — Python`}
              graphTitle={topic.graphTitle || "График"}
            />
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function NeuronFormulaExplainer({ x1, x2, w1, w2, b, z, y }: { x1: number; x2: number; w1: number; w2: number; b: number; z: number; y: number }) {
  return (
    <div className="space-y-4">
      <Formula>{`z = w₁x₁ + w₂x₂ + b
z = ${round(w1, 2)}·${round(x1, 2)} + ${round(w2, 2)}·${round(x2, 2)} + ${round(b, 2)}
z = ${round(z, 4)}

y = sigmoid(z)
y = ${round(y, 4)}`}</Formula>

      <div className="grid gap-3 md:grid-cols-2">
        <SmallInfo title="x₁ және x₂" text="Бұл — кіріс мәндер. Яғни нейронға берілетін бастапқы ақпарат." />
        <SmallInfo title="w₁ және w₂" text="Бұл — салмақтар. Қай кіріс қаншалық маңызды екенін көрсетеді." />
        <SmallInfo title="b (bias)" text="Bias — қосымша ығысу. Ол нейронның шекарасын оңға немесе солға жылжытады." />
        <SmallInfo title="z" text="z — салмақталған қосынды. Алдымен осы аралық мән есептеледі." />
        <SmallInfo title="sigmoid(z)" text="Sigmoid функциясы z мәнін 0 мен 1 аралығына келтіреді." />
        <SmallInfo title="y" text="y — нейронның соңғы шығысы. Бұл нейронның нәтижесі." />
      </div>
    </div>
  );
}

function NeuronPage() {
  const [x1, setX1] = useState(0.5);
  const [x2, setX2] = useState(0.3);
  const [w1, setW1] = useState(0.8);
  const [w2, setW2] = useState(0.6);
  const [b, setB] = useState(0.2);

  const z = w1 * x1 + w2 * x2 + b;
  const y = sigmoid(z);

  const graphX: number[] = [];
  const graphY: number[] = [];
  for (let xx = -10; xx <= 10; xx += 1) {
    graphX.push(xx);
    graphY.push(sigmoid(w1 * xx + w2 * x2 + b));
  }

  return (
    <SectionCard title="Бір нейрон" accent="from-blue-600 to-cyan-600">
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <RangeField label="x₁ кірісі" value={x1} min={0} max={1} step={0.01} onChange={setX1} />
          <RangeField label="x₂ кірісі" value={x2} min={0} max={1} step={0.01} onChange={setX2} />
          <RangeField label="w₁ салмағы" value={w1} min={-2} max={2} step={0.01} onChange={setW1} />
          <RangeField label="w₂ салмағы" value={w2} min={-2} max={2} step={0.01} onChange={setW2} />
          <RangeField label="b bias" value={b} min={-2} max={2} step={0.01} onChange={setB} />

          <NeuronFormulaExplainer x1={x1} x2={x2} w1={w1} w2={w2} b={b} z={z} y={y} />
        </div>

        <div className="space-y-4">
          <SmallInfo
            title="График нені көрсетеді?"
            text="Бұл графикте x осі бойынша x₁ өзгеріп тұр деп есептеледі, ал x₂, w₁, w₂ және b ағымдағы мәндерінде қалады. Сондықтан салмақтар мен bias өзгерген сайын график те өзгереді."
          />
          <InlineLineChart xValues={graphX} yValues={graphY} title="y = sigmoid(w₁·x + w₂·x₂ + b)" />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Қазіргі нүкте: x₁ = <b>{round(x1, 2)}</b>, y = <b>{round(y, 4)}</b>
          </div>
        </div>
      </div>
    </SectionCard>
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
        <ellipse cx='160' cy='140' rx='18' ry='12' fill='#111827'/>
        <path d='M145 160 Q160 175 175 160' stroke='#111827' stroke-width='4' fill='none'/>
        <text x='160' y='220' text-anchor='middle' font-size='24' font-weight='700' fill='#111827'>Ит</text>
      </svg>
    `)}`;
  };

  return (
    <SectionCard title="Мысық пен итті ажырату" accent="from-pink-600 to-orange-500">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SmallInfo
            title="Қалай ажыратады?"
            text="Егер құлақтың үшкірлігі жоғары болса, мұрт белгілері айқын болса, тұмсық қысқалау болса және құйрық жіңішкелеу болса, нәтиже мысыққа жақындайды. Ал тұмсық ұзындау, құлақ аз үшкір, мұрт белгілері аз және құйрық жуан болса, итке жақындайды."
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
          {showResult && (
            <>
              <Formula>{`Нәтиже: ${result === "cat" ? "Мысық" : "Ит"}
Мысық ықтималдығы: ${round(catScore, 3)}
Ит ықтималдығы: ${round(dogScore, 3)}`}</Formula>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center">
                <img src={makeAnimalSvg(result)} alt={result} className="mx-auto rounded-2xl border border-slate-200" />
              </div>
            </>
          )}
        </div>
      </div>
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
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
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
      setMicResult("Микрофонға рұқсат берілмеді. Бұл рұқсатты браузерден өзіңіз ашасыз.");
    }
  };

  return (
    <SectionCard title="Дыбыс бөлімі" accent="from-violet-600 to-fuchsia-600">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SmallInfo
            title="Толық анықтама"
            text="Жиілік Hz-пен өлшенеді. Жиілік жоғарылаған сайын дыбыс жіңішкереді. Дыбыс қаттылығы 0 мен 1 аралығында беріледі. Ұзақтық секундпен өлшенеді."
          />
          <RangeField label="Жиілік" value={freq} min={100} max={1500} step={1} unit="Hz" onChange={setFreq} />
          <RangeField label="Ұзақтық" value={duration} min={0.2} max={3} step={0.1} unit="сек." onChange={setDuration} />
          <RangeField label="Дыбыс қаттылығы" value={volume} min={0.1} max={1} step={0.01} unit="бірлік" onChange={setVolume} />
          <button onClick={playSound} className="rounded-2xl bg-violet-600 px-5 py-3 text-white">
            🔊 Дыбысты тыңдау
          </button>
          <button onClick={startMic} className="rounded-2xl bg-indigo-600 px-5 py-3 text-white">
            🎤 Микрофонды тексеру
          </button>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm">{audioStatus}</div>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm">{micResult}</div>
        </div>
        <canvas ref={canvasRef} width={560} height={240} className="w-full rounded-3xl border border-slate-200 bg-white" />
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

  const weather = useMemo(() => {
    const rain = humidity * 0.5 + wind * 2 + (760 - pressure) * 0.8;
    const clear = (100 - humidity) * 0.6 + temp * 1.4 + (pressure - 730) * 0.7;
    const snow = temp < 2 ? 80 + humidity * 0.2 : 10;
    const best = Math.max(rain, clear, snow);
    return best === rain ? "Жаңбыр" : best === clear ? "Ашық" : "Қар";
  }, [temp, humidity, wind, pressure]);

  const health = useMemo(() => {
    if (bodyTemp > 37.5 || pulse > 95 || bp > 140 || glucose > 7) return "Қауіп жоғары";
    return "Қауіп төмен";
  }, [bodyTemp, pulse, bp, glucose]);

  return (
    <div className="space-y-6">
      <SectionCard title="Ауа райы бөлімі" accent="from-emerald-600 to-cyan-600">
        <div className="space-y-4">
          <SmallInfo
            title="Толық анықтама"
            text="Температура °C-пен өлшенеді. Ылғалдылық пайызбен (%) өлшенеді. Жел м/с-пен беріледі. Қысым hPa-мен өлшенеді. Температура төмен және ылғал жоғары болса қар ықтималдығы өседі. Ылғал жоғары, жел бар, қысым төмен болса жаңбыр ықтимал. Ылғал төмен, қысым жоғары, температура қалыпты болса ашық ауа райы ықтимал."
          />
          <RangeField label="Температура" value={temp} min={-20} max={40} step={1} unit="°C" onChange={setTemp} />
          <RangeField label="Ылғалдылық" value={humidity} min={0} max={100} step={1} unit="%" onChange={setHumidity} />
          <RangeField label="Жел жылдамдығы" value={wind} min={0} max={20} step={1} unit="м/с" onChange={setWind} />
          <RangeField label="Қысым" value={pressure} min={720} max={780} step={1} unit="hPa" onChange={setPressure} />
          <Formula>{`Нәтиже: ${weather}`}</Formula>
        </div>
      </SectionCard>

      <SectionCard title="Денсаулық бөлімі" accent="from-rose-600 to-orange-500">
        <div className="space-y-4">
          <SmallInfo
            title="Толық анықтама"
            text="Дене қызуы °C-пен өлшенеді. Тамыр соғысы bpm-пен өлшенеді. Қан қысымы mmHg-пен беріледі. Глюкоза mmol/L-пен көрсетіледі. Егер қызу 37.5-тен жоғары болса, тамыр соғысы 95-тен жоғары болса, қысым 140-тан жоғары болса немесе глюкоза 7-ден жоғары болса, қауіп жоғары деп белгіленеді."
          />
          <RangeField label="Дене қызуы" value={bodyTemp} min={35} max={41} step={0.1} unit="°C" onChange={setBodyTemp} />
          <RangeField label="Тамыр соғысы" value={pulse} min={40} max={160} step={1} unit="bpm" onChange={setPulse} />
          <RangeField label="Қан қысымы" value={bp} min={80} max={180} step={1} unit="mmHg" onChange={setBp} />
          <RangeField label="Глюкоза" value={glucose} min={3} max={12} step={0.1} unit="mmol/L" onChange={setGlucose} />
          <Formula>{`Нәтиже: ${health}`}</Formula>
        </div>
      </SectionCard>
    </div>
  );
}

function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [grayImg, setGrayImg] = useState<string | null>(null);
  const [edgeImg, setEdgeImg] = useState<string | null>(null);
  const [status, setStatus] = useState("Камера өшірулі");

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus("Бұл браузер камераны қолдамайды");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus("Камера қосылды");
    } catch {
      setStatus("Камера ашылмады немесе рұқсат берілмеді. Рұқсатты браузерден ашыңыз.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("Камера тоқтатылды");
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL("image/png"));
    setGrayImg(null);
    setEdgeImg(null);
    setStatus("Сурет түсірілді");
  };

  const toGray = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      imgData.data[i] = gray;
      imgData.data[i + 1] = gray;
      imgData.data[i + 2] = gray;
    }

    ctx.putImageData(imgData, 0, 0);
    setGrayImg(canvas.toDataURL("image/png"));
    setStatus("Сұр түске айналды");
  };

  const detectEdges = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length - 4; i += 4) {
      const diff =
        Math.abs(data[i] - data[i + 4]) +
        Math.abs(data[i + 1] - data[i + 5]) +
        Math.abs(data[i + 2] - data[i + 6]);
      const val = diff > 100 ? 0 : 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }

    ctx.putImageData(imgData, 0, 0);
    setEdgeImg(canvas.toDataURL("image/png"));
    setStatus("Жиектер анықталды");
  };

  const download = () => {
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = canvasRef.current?.toDataURL("image/png") || "";
    link.click();
  };

  return (
    <SectionCard title="Камера бөлімі" accent="from-cyan-600 to-blue-700">
      <div className="space-y-6">
        <SmallInfo
          title="Түсіндірме"
          text="Камера және микрофон рұқсатын сайттың өзі аша алмайды. Бұл рұқсатты браузердің адрес жолағындағы белгі арқылы өзіңіз қосасыз."
        />
        <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl border bg-black" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex flex-wrap gap-3">
          <button onClick={startCamera} className="rounded bg-blue-600 px-4 py-2 text-white">Камера қосу</button>
          <button onClick={capture} className="rounded bg-green-600 px-4 py-2 text-white">Сурет түсіру</button>
          <button onClick={toGray} className="rounded bg-gray-600 px-4 py-2 text-white">Сұр түске айналдыру</button>
          <button onClick={detectEdges} className="rounded bg-purple-600 px-4 py-2 text-white">Жиек анықтау</button>
          <button onClick={download} className="rounded bg-orange-500 px-4 py-2 text-white">Жүктеу</button>
          <button onClick={stopCamera} className="rounded bg-red-500 px-4 py-2 text-white">Тоқтату</button>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-sm">{status}</div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="mb-2 font-semibold">Түпнұсқа</div>
            {captured && <img src={captured} alt="Captured" className="rounded border" />}
          </div>
          <div>
            <div className="mb-2 font-semibold">Сұр</div>
            {grayImg && <img src={grayImg} alt="Gray" className="rounded border" />}
          </div>
          <div>
            <div className="mb-2 font-semibold">Жиек</div>
            {edgeImg && <img src={edgeImg} alt="Edge" className="rounded border" />}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function PracticePage() {
  const pyodideReady = usePyodideLoader();
  const [practiceCode, setPracticeCode] = useState(`x_values = []
y_values = []

for x in range(-5, 6):
    y = x * x
    x_values.append(x)
    y_values.append(y)
    print(x, y)`);
  const [output, setOutput] = useState("Нәтиже осында шығады...");
  const [loading, setLoading] = useState(false);
  const [xValues, setXValues] = useState<number[]>([]);
  const [yValues, setYValues] = useState<number[]>([]);

  const [quizAnswers, setQuizAnswers] = useState(["", "", "", "", ""]);
  const [quizResult, setQuizResult] = useState("");
  const [showCorrect, setShowCorrect] = useState(false);

  const quizQuestions = [
    "1. Нейрондық желі деген не?",
    "2. Sigmoid функциясы қандай аралықта мән береді?",
    "3. ReLU формуласы қандай?",
    "4. MSE не өлшейді?",
    "5. Python-да print не істейді?",
  ];

  const correctHints = [
    "Дұрыс жауап үлгісі: нейрондық желі — деректерді өңдеп, заңдылықтарды үйренетін модель.",
    "Дұрыс жауап үлгісі: 0 мен 1 аралығында.",
    "Дұрыс жауап үлгісі: max(0, x).",
    "Дұрыс жауап үлгісі: модель қателігін өлшейді.",
    "Дұрыс жауап үлгісі: экранға мәлімет шығарады.",
  ];

  const tasks = [
    "1. z = 0.6×0.7 + 0.5×0.4 + 0.1 мәнін есептеңіз.",
    "2. Sigmoid пен ReLU айырмашылығын жазыңыз.",
    "3. MSE қате функциясының формуласын жазыңыз.",
    "4. Confusion Matrix не үшін керек?",
    "5. RGB → Gray формуласын жазыңыз.",
    "6. Мысық пен итті ажыратуда қандай белгілер пайдалы?",
    "7. Ауа райы болжауда қандай параметрлер маңызды?",
    "8. Денсаулық деректерінде қауіп қалай бағаланады?",
    "9. Нейрондық желі қай салаларда қолданылады?",
    "10. Градиенттік түсудің мақсаты қандай?",
  ];

  const runPractice = async () => {
    try {
      setLoading(true);
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
${practiceCode.split("\n").map((line) => "    " + line).join("\n")}
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

  const gradeQuiz = () => {
    let score = 0;
    if (quizAnswers[0].toLowerCase().includes("модель") || quizAnswers[0].toLowerCase().includes("дерек")) score++;
    if (quizAnswers[1].includes("0") && quizAnswers[1].includes("1")) score++;
    if (quizAnswers[2].toLowerCase().includes("max")) score++;
    if (quizAnswers[3].toLowerCase().includes("қате")) score++;
    if (quizAnswers[4].toLowerCase().includes("шығар")) score++;

    const percent = Math.round((score / 5) * 100);
    const grade = percent >= 90 ? "5" : percent >= 70 ? "4" : percent >= 50 ? "3" : "2";
    setQuizResult(`Ұпай: ${score}/5 | Пайыз: ${percent}% | Баға: ${grade}`);
    setShowCorrect(true);
  };

  return (
    <SectionCard title="Практикалық есептер" accent="from-amber-500 to-orange-600">
      <div className="space-y-6">
        <div className="space-y-3">
          {tasks.map((t) => (
            <div key={t} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {t}
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 text-xl font-bold">Python арқылы орындау</div>
          <div className="mb-3 text-sm text-slate-700">Төмендегі жерге өз программаңызды жазыңыз да, орындаңыз.</div>

          <textarea
            value={practiceCode}
            onChange={(e) => setPracticeCode(e.target.value)}
            className="h-64 w-full rounded-xl border border-slate-300 p-3 font-mono text-sm"
          />

          <div className="mt-3">
            <button onClick={runPractice} className="rounded-xl bg-blue-600 px-4 py-2 text-white">
              ▶ Орындау
            </button>
          </div>

          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-3 text-sm text-green-400 whitespace-pre-wrap">
            {loading ? "Python іске қосылуда..." : output}
          </pre>

          {xValues.length > 0 && yValues.length > 0 && (
            <div className="mt-4">
              <InlineLineChart xValues={xValues} yValues={yValues} title="Практика графигі" />
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 text-xl font-bold">Тест және баға қою</div>
          <div className="space-y-3">
            {quizQuestions.map((q, i) => (
              <div key={i} className="rounded-2xl border bg-white p-4">
                <div className="mb-2 font-medium">{q}</div>
                <input
                  value={quizAnswers[i]}
                  onChange={(e) => {
                    const copy = [...quizAnswers];
                    copy[i] = e.target.value;
                    setQuizAnswers(copy);
                  }}
                  placeholder="Жауабыңызды жазыңыз"
                  className="w-full rounded-xl border border-slate-300 p-3"
                />
              </div>
            ))}

            <button onClick={gradeQuiz} className="rounded-2xl bg-purple-600 px-5 py-3 font-semibold text-white">
              Баға қою
            </button>

            {quizResult && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 font-semibold text-slate-800">
                {quizResult}
              </div>
            )}

            {showCorrect && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 text-lg font-bold">Дұрыс жауап үлгілері</div>
                <div className="space-y-2 text-sm text-slate-700">
                  {correctHints.map((hint) => (
                    <div key={hint}>{hint}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export default function Page() {
  const [menu, setMenu] = useState<MenuKey>("home");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { data: session, status } = useSession();

  const isLoggedIn = !!session?.user;

  const isLessonMenu =
    menu === "theory" ||
    menu === "method" ||
    menu === "neuron" ||
    menu === "image" ||
    menu === "sound" ||
    menu === "sensors" ||
    menu === "camera" ||
    menu === "practice";

  useEffect(() => {
    try {
      const savedMenu = localStorage.getItem("nn_last_menu");
      if (savedMenu) {
        setMenu(savedMenu as MenuKey);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("nn_last_menu", menu);
    } catch {}

    if (isLoggedIn && menu !== "home") {
      fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastMenu: menu,
          lastTopic: menu,
          percent:
            menu === "theory"
              ? 15
              : menu === "method"
              ? 30
              : menu === "neuron"
              ? 45
              : menu === "image"
              ? 60
              : menu === "sound"
              ? 70
              : menu === "sensors"
              ? 80
              : menu === "camera"
              ? 90
              : menu === "practice"
              ? 100
              : 0,
        }),
      }).catch(() => {});
    }
  }, [menu, isLoggedIn]);

return (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 text-slate-900">
    <Navbar current={menu} onChange={setMenu} />

    <main
      id="main-content"
      className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6"
    >
      {menu === "home" && <HomePage />}

      {!isLoggedIn && isLessonMenu && status !== "loading" && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Бұл бөлім тіркелгеннен кейін ашылады
          </h2>
          <p className="mb-6 text-slate-700">
            Теория, әдістемелік бөлім, практика және басқа сабақтар тек
            Google арқылы тіркелген қолданушыларға қолжетімді.
          </p>
          <a
            href="/login"
            className="inline-flex rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Тіркелу / Кіру
          </a>
        </div>
      )}

      {isLoggedIn && menu === "theory" && <TheoryPage />}
      {isLoggedIn && menu === "method" && <MethodPage />}
      {isLoggedIn && menu === "neuron" && <NeuronPage />}
      {isLoggedIn && menu === "image" && <ImagePage />}
      {isLoggedIn && menu === "sound" && <SoundPage />}
      {isLoggedIn && menu === "sensors" && <SensorsPage />}
      {isLoggedIn && menu === "camera" && <CameraPage />}
      {isLoggedIn && menu === "practice" && <PracticePage />}
    </main>
  </div>
);
}
      