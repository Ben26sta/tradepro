import { useState, useEffect, useRef } from "react";
import { SECTIONS, SECTION_LIST } from "./courses.js";

function save(d) { try { localStorage.setItem("tradepro_v1", JSON.stringify(d)); } catch(e) {} }
function load() { try { const s=localStorage.getItem("tradepro_v1"); return s?JSON.parse(s):null; } catch(e) { return null; } }

const THEME = {
  bg:"#060a14", card:"#0d1220", card2:"#111827", border:"#1e2d45",
  text:"#e8eaf0", subtext:"#6b7db3", accent:"#4f7ef7",
  green:"#10b981", red:"#ef4444", yellow:"#f59e0b", purple:"#a855f7"
};

// Mini chart SVG component
function MiniChart({ data, color="#4f7ef7", height=40 }) {
  if(!data||data.length<2) return null;
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const w=200, h=height;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Candlestick chart
function CandleChart({ candles, height=120 }) {
  if(!candles||!candles.length) return null;
  const highs=candles.map(c=>c.high), lows=candles.map(c=>c.low);
  const max=Math.max(...highs), min=Math.min(...lows), range=max-min||1;
  const w=280, h=height, cw=w/candles.length;
  const py=(v)=>h-((v-min)/range)*h;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ background:"#060a14", borderRadius:8 }}>
      {candles.map((c,i)=>{
        const x=i*cw+cw*0.1, bw=cw*0.7;
        const bull=c.close>=c.open;
        const color=bull?"#10b981":"#ef4444";
        const bodyTop=py(Math.max(c.open,c.close));
        const bodyH=Math.abs(py(c.open)-py(c.close))||1;
        const cx=i*cw+cw/2;
        return (
          <g key={i}>
            <line x1={cx} y1={py(c.high)} x2={cx} y2={py(c.low)} stroke={color} strokeWidth="1"/>
            <rect x={x} y={bodyTop} width={bw} height={bodyH} fill={color}/>
          </g>
        );
      })}
    </svg>
  );
}

// Sample candle data for demo
const DEMO_CANDLES = [
  {open:2300,high:2315,low:2295,close:2310},{open:2310,high:2325,low:2305,close:2320},
  {open:2320,high:2330,low:2310,close:2315},{open:2315,high:2318,low:2298,close:2302},
  {open:2302,high:2312,low:2295,close:2308},{open:2308,high:2335,low:2305,close:2330},
  {open:2330,high:2345,low:2325,close:2340},{open:2340,high:2355,low:2330,close:2348},
  {open:2348,high:2352,low:2335,close:2338},{open:2338,high:2345,low:2330,close:2342},
];

const DEMO_LINE = [2300,2310,2320,2315,2302,2308,2330,2340,2348,2342];

function AchievementPopup({ text, onClose }) {
  useEffect(()=>{ const t=setTimeout(onClose,3000); return()=>clearTimeout(t); },[]);
  return (
    <div style={{ position:"fixed", top:80, left:"50%", transform:"translateX(-50%)", zIndex:999, background:"linear-gradient(135deg,#1a1040,#0d0820)", border:"1px solid #a855f7", borderRadius:16, padding:"13px 20px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 32px rgba(168,85,247,0.5)", animation:"slideDown 0.4s ease", maxWidth:320, width:"90%" }}>
      <span style={{ fontSize:28 }}>🏆</span>
      <div><div style={{ fontSize:11, color:"#a855f7", textTransform:"uppercase", letterSpacing:1 }}>Достижение!</div><div style={{ fontSize:14, fontWeight:"bold", color:"#fff" }}>{text}</div></div>
    </div>
  );
}

function WelcomeScreen({ onClose }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon:"📊", title:"TradePro", text:"Обучение трейдингу от А до Я. Форекс, крипто, акции, продвинутые стратегии — всё в одном приложении." },
    { icon:"📚", title:"Разделы и уроки", text:"6 разделов: Основы, Форекс, Крипто, Акции, Продвинутый, Психология. Каждый урок — теория + тест с объяснениями." },
    { icon:"📸", title:"Анализ чарта по фото", text:"Сделай скриншот любого чарта → ИИ проанализирует паттерны, уровни, тренд и даст прогноз и торговые идеи." },
    { icon:"🤖", title:"ИИ-ментор", text:"Задавай любые вопросы по трейдингу. ИИ объяснит концепции, разберёт твою стратегию и поможет с анализом." },
    { icon:"⚠️", title:"Важно знать", text:"Трейдинг сопряжён с высоким риском. Всё обучение носит образовательный характер и не является финансовой рекомендацией. Торгуй только на средства которые готов потерять." },
  ];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.95)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:22, padding:28, maxWidth:360, width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ fontSize:50, marginBottom:10 }}>{steps[step].icon}</div>
          <div style={{ fontSize:19, fontWeight:"bold", color:THEME.text, marginBottom:8 }}>{steps[step].title}</div>
          <div style={{ fontSize:13, color:THEME.subtext, lineHeight:1.7 }}>{steps[step].text}</div>
        </div>
        <div style={{ display:"flex", gap:5, justifyContent:"center", marginBottom:20 }}>
          {steps.map((_,i)=><div key={i} style={{ width:i===step?22:8, height:8, borderRadius:4, background:i===step?THEME.accent:THEME.border, transition:"all 0.3s" }} />)}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{ flex:1, padding:12, background:"transparent", border:`1px solid ${THEME.border}`, borderRadius:12, color:THEME.subtext, cursor:"pointer", fontFamily:"inherit" }}>← Назад</button>}
          <button onClick={()=>step<steps.length-1?setStep(s=>s+1):onClose()} style={{ flex:1, padding:12, background:`linear-gradient(135deg,${THEME.accent},#3b6be0)`, border:"none", borderRadius:12, color:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:"bold" }}>
            {step<steps.length-1?"Далее →":"Начать обучение 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ progress, onNavigate }) {
  const totalDone = SECTION_LIST.reduce((acc,sid)=>{
    const s=SECTIONS[sid];
    return acc+s.topics.filter(t=>progress[t.id]?.done).length;
  },0);
  const totalTopics = SECTION_LIST.reduce((acc,sid)=>acc+SECTIONS[sid].topics.length,0);

  return (
    <div style={{ padding:"14px 16px", overflowY:"auto", maxHeight:"calc(100vh - 120px)" }}>
      {/* Header stats */}
      <div style={{ background:`linear-gradient(135deg,#0d1a2e,#0a1220)`, border:`1px solid ${THEME.border}`, borderRadius:18, padding:18, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div>
            <div style={{ fontSize:13, color:THEME.subtext }}>Прогресс обучения</div>
            <div style={{ fontSize:24, fontWeight:"bold", color:THEME.text }}>{totalDone} / {totalTopics} тем</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:22, fontWeight:"bold", color:THEME.accent }}>{Math.round(totalDone/totalTopics*100)}%</div>
            <div style={{ fontSize:11, color:THEME.subtext }}>завершено</div>
          </div>
        </div>
        <div style={{ background:THEME.border, borderRadius:6, height:8, overflow:"hidden" }}>
          <div style={{ width:`${Math.round(totalDone/totalTopics*100)}%`, height:"100%", background:`linear-gradient(90deg,${THEME.accent},${THEME.purple})`, borderRadius:6, transition:"width 0.5s" }} />
        </div>
        {/* Mini chart demo */}
        <div style={{ marginTop:12, opacity:0.6 }}>
          <MiniChart data={DEMO_LINE} color={THEME.green}/>
        </div>
        <div style={{ fontSize:11, color:THEME.subtext, marginTop:4, textAlign:"right" }}>XAU/USD демо · 2300 → 2342</div>
      </div>

      {/* Анализ чарта */}
      <button onClick={()=>onNavigate("chartanalysis")} style={{ width:"100%", marginBottom:14, padding:"14px 16px", background:"linear-gradient(135deg,#1a0d30,#0d0820)", border:"1px solid #a855f7", borderRadius:16, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:14, textAlign:"left" }}>
        <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#a855f7,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>📸</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:"bold", color:"#fff", marginBottom:1 }}>Анализ чарта по фото</div>
          <div style={{ fontSize:12, color:"#8877aa" }}>Загрузи скриншот → ИИ разберёт паттерны и тренд</div>
        </div>
        <span style={{ color:"#a855f7", fontSize:18 }}>→</span>
      </button>

      {/* ИИ ментор */}
      <button onClick={()=>onNavigate("mentor")} style={{ width:"100%", marginBottom:16, padding:"14px 16px", background:"linear-gradient(135deg,#0d1a30,#081020)", border:`1px solid ${THEME.accent}`, borderRadius:16, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:14, textAlign:"left" }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${THEME.accent},#3b6be0)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🤖</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:"bold", color:"#fff", marginBottom:1 }}>ИИ-ментор по трейдингу</div>
          <div style={{ fontSize:12, color:THEME.subtext }}>Задай любой вопрос — объясним простым языком</div>
        </div>
        <span style={{ color:THEME.accent, fontSize:18 }}>→</span>
      </button>

      {/* Разделы */}
      <div style={{ fontSize:12, color:THEME.subtext, marginBottom:10, textTransform:"uppercase", letterSpacing:1 }}>Разделы обучения</div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {SECTION_LIST.map(sid=>{
          const s=SECTIONS[sid];
          const done=s.topics.filter(t=>progress[t.id]?.done).length;
          const pct=Math.round(done/s.topics.length*100);
          return (
            <button key={sid} onClick={()=>onNavigate("section",sid)} style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:14, padding:"13px 15px", textAlign:"left", cursor:"pointer", color:THEME.text, display:"flex", alignItems:"center", gap:13, transition:"all 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=s.color} onMouseLeave={e=>e.currentTarget.style.borderColor=THEME.border}>
              <div style={{ width:42, height:42, borderRadius:11, background:`${s.color}20`, border:`1px solid ${s.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{s.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:"bold", marginBottom:2 }}>{s.title}</div>
                <div style={{ fontSize:11, color:THEME.subtext, marginBottom:4 }}>{s.description}</div>
                <div style={{ background:THEME.border, borderRadius:4, height:4, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:s.color, borderRadius:4 }} />
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:13, color:s.color, fontWeight:"bold" }}>{pct}%</div>
                <div style={{ fontSize:10, color:THEME.subtext }}>{done}/{s.topics.length}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div style={{ margin:"16px 0 4px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:12, padding:12, fontSize:11, color:"#f87171", lineHeight:1.6 }}>
        ⚠️ Данное приложение носит исключительно образовательный характер. Не является финансовой рекомендацией. Трейдинг сопряжён с высоким риском потери капитала.
      </div>
    </div>
  );
}

function SectionScreen({ sectionId, progress, onNavigate }) {
  const s = SECTIONS[sectionId];
  return (
    <div style={{ padding:"14px 16px", overflowY:"auto", maxHeight:"calc(100vh - 120px)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <div style={{ width:46, height:46, borderRadius:13, background:`${s.color}20`, border:`1px solid ${s.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{s.icon}</div>
        <div>
          <div style={{ fontSize:18, fontWeight:"bold", color:THEME.text }}>{s.title}</div>
          <div style={{ fontSize:12, color:THEME.subtext }}>{s.topics.length} тем · {s.description}</div>
        </div>
      </div>

      {/* Demo candle chart for visual appeal */}
      <div style={{ marginBottom:14, borderRadius:12, overflow:"hidden", border:`1px solid ${THEME.border}` }}>
        <CandleChart candles={DEMO_CANDLES}/>
        <div style={{ background:THEME.card, padding:"6px 12px", fontSize:11, color:THEME.subtext, display:"flex", justifyContent:"space-between" }}>
          <span>XAU/USD · H4 демо</span>
          <span style={{ color:THEME.green }}>▲ +1.85%</span>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {s.topics.map((topic, idx)=>{
          const done = progress[topic.id]?.done;
          const score = progress[topic.id]?.score;
          const locked = idx > 0 && !s.topics.slice(0,idx).every(t=>progress[t.id]?.done);
          return (
            <button key={topic.id} onClick={()=>!locked&&onNavigate("topic",sectionId,topic.id)} style={{ background:THEME.card, border:`1px solid ${done?"#10b981":locked?"#0d1a2e":THEME.border}`, borderRadius:13, padding:"13px 15px", textAlign:"left", cursor:locked?"not-allowed":"pointer", color:THEME.text, display:"flex", alignItems:"center", gap:12, opacity:locked?0.5:1, transition:"all 0.2s" }}
              onMouseEnter={e=>!locked&&(e.currentTarget.style.borderColor=s.color)} onMouseLeave={e=>e.currentTarget.style.borderColor=done?"#10b981":locked?"#0d1a2e":THEME.border}>
              <div style={{ width:42, height:42, borderRadius:11, background:done?`rgba(16,185,129,0.15)`:locked?"#0d1a2e":`${s.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                {locked?"🔒":done?"✅":topic.emoji}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:"bold", marginBottom:2 }}>{topic.title}</div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:11, background:`${s.color}20`, color:s.color, padding:"2px 8px", borderRadius:10 }}>{topic.level}</span>
                  {done&&<span style={{ fontSize:11, color:THEME.green }}>✓ {score}%</span>}
                </div>
              </div>
              {!locked&&<span style={{ color:done?THEME.green:s.color, fontSize:16 }}>→</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TopicScreen({ sectionId, topicId, onBack, onComplete }) {
  const s = SECTIONS[sectionId];
  const topic = s.topics.find(t=>t.id===topicId);
  const [phase, setPhase] = useState("learn"); // learn | quiz | result
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [showExp, setShowExp] = useState(false);

  if(!topic) return null;
  const q = topic.quiz[qIdx];

  function checkAnswer() {
    setChecked(true);
    setShowExp(true);
    if(selected===q.answer) setCorrect(c=>c+1);
  }

  function nextQ() {
    if(qIdx<topic.quiz.length-1) { setQIdx(q=>q+1); setSelected(null); setChecked(false); setShowExp(false); }
    else { const score=Math.round((correct+(selected===q.answer?1:0))/topic.quiz.length*100); setPhase("result"); onComplete(topicId,score); }
  }

  if(phase==="learn") return (
    <div style={{ padding:"14px 16px", overflowY:"auto", maxHeight:"calc(100vh - 120px)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <span style={{ fontSize:28 }}>{topic.emoji}</span>
        <div>
          <div style={{ fontSize:16, fontWeight:"bold", color:THEME.text }}>{topic.title}</div>
          <span style={{ fontSize:11, background:`${s.color}20`, color:s.color, padding:"2px 8px", borderRadius:10 }}>{topic.level}</span>
        </div>
      </div>

      <div style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:16, padding:16, marginBottom:14 }}>
        <div style={{ fontSize:13, color:THEME.text, lineHeight:2.0, whiteSpace:"pre-line" }}>{topic.content}</div>
      </div>

      <button onClick={()=>setPhase("quiz")} style={{ width:"100%", padding:15, background:`linear-gradient(135deg,${s.color},${s.color}cc)`, border:"none", borderRadius:14, color:"#fff", fontSize:15, cursor:"pointer", fontFamily:"inherit", fontWeight:"bold" }}>
        Пройти тест ({topic.quiz.length} вопросов) →
      </button>
    </div>
  );

  if(phase==="quiz") return (
    <div style={{ padding:"14px 16px", overflowY:"auto", maxHeight:"calc(100vh - 120px)" }}>
      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ fontSize:13, fontWeight:"bold", color:THEME.text }}>Вопрос {qIdx+1}/{topic.quiz.length}</span>
          <span style={{ fontSize:12, color:THEME.green }}>✓ {correct}</span>
        </div>
        <div style={{ background:THEME.border, borderRadius:6, height:6, overflow:"hidden" }}>
          <div style={{ width:`${(qIdx/topic.quiz.length)*100}%`, height:"100%", background:s.color, borderRadius:6 }} />
        </div>
      </div>

      <div style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:16, padding:16, marginBottom:12 }}>
        <div style={{ fontSize:15, color:THEME.text, fontWeight:"500", lineHeight:1.6 }}>{q.q}</div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
        {q.options.map(opt=>{
          const isSel=selected===opt;
          const isCorr=checked&&opt===q.answer;
          const isWrong=checked&&isSel&&opt!==q.answer;
          return <button key={opt} onClick={()=>!checked&&setSelected(opt)} style={{ padding:"12px 15px", borderRadius:12, border:`2px solid ${isCorr?"#10b981":isWrong?"#ef4444":isSel?s.color:THEME.border}`, background:isCorr?"rgba(16,185,129,0.12)":isWrong?"rgba(239,68,68,0.12)":isSel?`${s.color}15`:THEME.card, color:isCorr?THEME.green:isWrong?THEME.red:THEME.text, textAlign:"left", cursor:checked?"default":"pointer", fontSize:13, fontFamily:"inherit", transition:"all 0.2s" }}>{opt}</button>;
        })}
      </div>

      {showExp&&q.explanation&&(
        <div style={{ background:"rgba(79,126,247,0.08)", border:"1px solid rgba(79,126,247,0.3)", borderRadius:12, padding:13, marginBottom:12 }}>
          <div style={{ fontSize:11, color:THEME.accent, marginBottom:5, textTransform:"uppercase", letterSpacing:1 }}>💡 Объяснение</div>
          <div style={{ fontSize:13, color:THEME.text, lineHeight:1.6 }}>{q.explanation}</div>
        </div>
      )}

      {!checked ? (
        <button onClick={checkAnswer} disabled={!selected} style={{ width:"100%", padding:13, background:selected?`linear-gradient(135deg,${s.color},${s.color}cc)`:"#0d1a2e", border:"none", borderRadius:12, color:"#fff", fontSize:15, cursor:selected?"pointer":"not-allowed", fontFamily:"inherit", fontWeight:"bold" }}>Проверить</button>
      ) : (
        <button onClick={nextQ} style={{ width:"100%", padding:13, background:`linear-gradient(135deg,${s.color},${s.color}cc)`, border:"none", borderRadius:12, color:"#fff", fontSize:15, cursor:"pointer", fontFamily:"inherit", fontWeight:"bold" }}>
          {qIdx<topic.quiz.length-1?"Следующий вопрос →":"Завершить тест ✓"}
        </button>
      )}
    </div>
  );

  if(phase==="result") {
    const finalCorrect=correct+(selected===q.answer?1:0);
    const sc=Math.round(finalCorrect/topic.quiz.length*100);
    return (
      <div style={{ padding:"14px 16px", overflowY:"auto", maxHeight:"calc(100vh - 120px)" }}>
        <div style={{ textAlign:"center", padding:"20px 0 16px" }}>
          <div style={{ fontSize:56, marginBottom:10 }}>{sc>=80?"🏆":sc>=60?"👍":"📚"}</div>
          <div style={{ fontSize:26, fontWeight:"bold", color:THEME.text, marginBottom:4 }}>{sc}%</div>
          <div style={{ fontSize:14, color:THEME.subtext }}>{finalCorrect} из {topic.quiz.length} верных</div>
          <div style={{ marginTop:10, fontSize:13, color:sc>=80?THEME.green:sc>=60?THEME.yellow:THEME.red }}>
            {sc>=80?"Отличный результат! Тема пройдена.":sc>=60?"Хорошо! Повтори для закрепления.":"Рекомендуем перечитать теорию."}
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>{setPhase("learn");setQIdx(0);setSelected(null);setChecked(false);setCorrect(0);setShowExp(false);}} style={{ flex:1, padding:13, background:"transparent", border:`1px solid ${THEME.border}`, borderRadius:12, color:THEME.subtext, cursor:"pointer", fontFamily:"inherit" }}>🔄 Повторить</button>
          <button onClick={onBack} style={{ flex:1, padding:13, background:`linear-gradient(135deg,${s.color},${s.color}cc)`, border:"none", borderRadius:12, color:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:"bold" }}>← К разделу</button>
        </div>
      </div>
    );
  }
}

function ChartAnalysisScreen() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  async function analyzeChart(file) {
    setLoading(true); setResult(null); setError(null);
    try {
      const base64 = await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=()=>rej(new Error("Ошибка")); r.readAsDataURL(file); });
      const resp = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-haiku-4-5-20251001", max_tokens:800,
          system:`Ты опытный трейдер и аналитик. Анализируй график (чарт) и давай детальный анализ. Отвечай только JSON без markdown:
{"instrument":"инструмент если видно","timeframe":"таймфрейм если видно","trend":"направление тренда (бычий/медвежий/боковой)","trend_strength":"сила тренда (сильный/средний/слабый)","key_levels":["уровень 1","уровень 2"],"patterns":["паттерн 1 если есть"],"support":"ближайшая поддержка","resistance":"ближайшее сопротивление","signal":"торговый сигнал (покупка/продажа/нейтрально)","forecast":"краткий прогноз 2-3 предложения","risks":"ключевые риски","recommendation":"конкретная рекомендация"}`,
          messages:[{ role:"user", content:[
            { type:"image", source:{ type:"base64", media_type:file.type||"image/jpeg", data:base64 } },
            { type:"text", text:"Проанализируй этот торговый чарт. Дай полный технический анализ в JSON." }
          ]}]
        })
      });
      const data = await resp.json();
      const text = data.content?.map(b=>b.text||"").join("") || "";
      try { setResult(JSON.parse(text.replace(/```json|```/g,"").trim())); }
      catch(e) { setError("Не удалось разобрать ответ. Попробуй другой скриншот."); }
    } catch(e) { setError("Ошибка: " + e.message); }
    setLoading(false);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if(!file) return;
    e.target.value = "";
    setImage(URL.createObjectURL(file));
    setResult(null);
    analyzeChart(file);
  }

  const signalColor = result?.signal?.includes("покупка")?THEME.green:result?.signal?.includes("продажа")?THEME.red:THEME.yellow;

  return (
    <div style={{ padding:"14px 16px", overflowY:"auto", maxHeight:"calc(100vh - 120px)" }}>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:17, fontWeight:"bold", color:THEME.text, marginBottom:3 }}>📸 Анализ чарта по фото</div>
        <div style={{ fontSize:13, color:THEME.subtext, lineHeight:1.6 }}>Загрузи скриншот чарта из любого приложения — ИИ проанализирует тренд, уровни и паттерны.</div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }} />
      <button onClick={()=>fileRef.current.click()} style={{ width:"100%", padding:15, background:"linear-gradient(135deg,#a855f7,#7c3aed)", border:"none", borderRadius:14, color:"#fff", fontSize:15, cursor:"pointer", fontFamily:"inherit", fontWeight:"bold", marginBottom:12 }}>
        📊 Загрузить скриншот чарта
      </button>

      {image && (
        <div style={{ marginBottom:12, borderRadius:14, overflow:"hidden", border:`2px solid ${THEME.border}`, position:"relative" }}>
          <img src={image} alt="чарт" style={{ width:"100%", maxHeight:220, objectFit:"cover", display:"block" }} />
          {loading && (
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:10 }}>
              <div style={{ fontSize:32 }}>🔍</div>
              <div style={{ color:"#fff", fontSize:14, fontWeight:"bold" }}>Анализирую чарт...</div>
              <div style={{ fontSize:12, color:"#8899bb" }}>Определяю тренд, уровни, паттерны</div>
            </div>
          )}
        </div>
      )}

      {result && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {/* Главный сигнал */}
          <div style={{ background:`${signalColor}15`, border:`2px solid ${signalColor}50`, borderRadius:16, padding:16, textAlign:"center" }}>
            <div style={{ fontSize:12, color:THEME.subtext, marginBottom:4, textTransform:"uppercase", letterSpacing:1 }}>Торговый сигнал</div>
            <div style={{ fontSize:22, fontWeight:"bold", color:signalColor, textTransform:"uppercase" }}>{result.signal}</div>
            {result.instrument && <div style={{ fontSize:13, color:THEME.subtext, marginTop:4 }}>{result.instrument} · {result.timeframe}</div>}
          </div>

          {/* Тренд */}
          <div style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:14, padding:14 }}>
            <div style={{ fontSize:11, color:THEME.subtext, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>📈 Анализ тренда</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <div style={{ background:`${THEME.accent}15`, borderRadius:10, padding:"6px 12px" }}>
                <div style={{ fontSize:11, color:THEME.subtext }}>Направление</div>
                <div style={{ fontSize:13, fontWeight:"bold", color:THEME.accent }}>{result.trend}</div>
              </div>
              <div style={{ background:`${THEME.accent}15`, borderRadius:10, padding:"6px 12px" }}>
                <div style={{ fontSize:11, color:THEME.subtext }}>Сила</div>
                <div style={{ fontSize:13, fontWeight:"bold", color:THEME.accent }}>{result.trend_strength}</div>
              </div>
              {result.support && <div style={{ background:"rgba(16,185,129,0.1)", borderRadius:10, padding:"6px 12px" }}>
                <div style={{ fontSize:11, color:THEME.subtext }}>Поддержка</div>
                <div style={{ fontSize:13, fontWeight:"bold", color:THEME.green }}>{result.support}</div>
              </div>}
              {result.resistance && <div style={{ background:"rgba(239,68,68,0.1)", borderRadius:10, padding:"6px 12px" }}>
                <div style={{ fontSize:11, color:THEME.subtext }}>Сопротивление</div>
                <div style={{ fontSize:13, fontWeight:"bold", color:THEME.red }}>{result.resistance}</div>
              </div>}
            </div>
          </div>

          {/* Паттерны */}
          {result.patterns?.length>0 && (
            <div style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:14, padding:14 }}>
              <div style={{ fontSize:11, color:THEME.subtext, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>🕯️ Паттерны</div>
              {result.patterns.map((p,i)=><div key={i} style={{ fontSize:13, color:THEME.text, marginBottom:3 }}>• {p}</div>)}
            </div>
          )}

          {/* Прогноз */}
          {result.forecast && (
            <div style={{ background:"rgba(79,126,247,0.08)", border:"1px solid rgba(79,126,247,0.3)", borderRadius:14, padding:14 }}>
              <div style={{ fontSize:11, color:THEME.accent, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>🔮 Прогноз</div>
              <div style={{ fontSize:13, color:THEME.text, lineHeight:1.7 }}>{result.forecast}</div>
            </div>
          )}

          {/* Рекомендация */}
          {result.recommendation && (
            <div style={{ background:"rgba(168,85,247,0.08)", border:"1px solid rgba(168,85,247,0.3)", borderRadius:14, padding:14 }}>
              <div style={{ fontSize:11, color:THEME.purple, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>✅ Рекомендация</div>
              <div style={{ fontSize:13, color:THEME.text, lineHeight:1.7 }}>{result.recommendation}</div>
            </div>
          )}

          {/* Риски */}
          {result.risks && (
            <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:14, padding:14 }}>
              <div style={{ fontSize:11, color:THEME.red, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>⚠️ Риски</div>
              <div style={{ fontSize:13, color:THEME.text, lineHeight:1.7 }}>{result.risks}</div>
            </div>
          )}

          <div style={{ fontSize:11, color:THEME.subtext, textAlign:"center", lineHeight:1.6, padding:"4px 0" }}>
            ⚠️ Анализ носит образовательный характер и не является финансовой рекомендацией
          </div>

          <button onClick={()=>{setImage(null);setResult(null);}} style={{ padding:12, background:"transparent", border:`1px solid ${THEME.border}`, borderRadius:12, color:THEME.subtext, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
            📸 Загрузить другой чарт
          </button>
        </div>
      )}

      {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid #ef4444", borderRadius:12, padding:13, color:THEME.red, fontSize:13 }}>❌ {error}</div>}

      {!image && !loading && (
        <div style={{ textAlign:"center", padding:"24px 0", color:THEME.subtext }}>
          <div style={{ fontSize:56, marginBottom:12 }}>📊</div>
          <div style={{ fontSize:14, lineHeight:1.8 }}>
            Загрузи скриншот чарта из<br/>MT4, MT5, TradingView,<br/>Binance или любого приложения
          </div>
        </div>
      )}
    </div>
  );
}

function MentorScreen() {
  const [messages, setMessages] = useState([
    { role:"assistant", text:"Привет! Я ИИ-ментор по трейдингу. 📊\n\nМогу помочь с:\n• Объяснением концепций и терминов\n• Анализом рыночных ситуаций\n• Разбором торговых стратегий\n• Вопросами по риск-менеджменту\n\nЗадай любой вопрос по трейдингу!" }
  ]);
  const [input, setInput] = useState(""); const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const QUICK = ["Что такое RSI?","Объясни уровни Фибоначчи","Как работает маржинальная торговля?","Разница между акциями и фьючерсами","Что такое ликвидация на крипто?"];

  async function send(text) {
    const msg=text||input.trim(); if(!msg||loading) return;
    setInput(""); setMessages(m=>[...m,{role:"user",text:msg}]); setLoading(true);
    try {
      const history=messages.slice(-8).map(m=>({role:m.role==="assistant"?"assistant":"user",content:m.text}));
      const resp=await fetch("/api/chat",{ method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:700,
          system:`Ты опытный трейдер и педагог. Отвечаешь на вопросы по трейдингу на русском языке.

Правила:
1. Объясняй простым языком с конкретными примерами (EUR/USD, XAU/USD, BTC/USD)
2. Используй эмодзи для наглядности (📈📉💡⚠️)
3. Давай практические советы
4. Всегда напоминай о рисках при обсуждении конкретных стратегий
5. Максимум 200 слов
6. НЕ давай конкретных финансовых рекомендаций ("купи X")
7. В конце задай уточняющий вопрос`,
          messages:[...history,{role:"user",content:msg}]
        })
      });
      const data=await resp.json();
      const text2=data.content?.map(b=>b.text||"").join("").trim()||"Ошибка";
      setMessages(m=>[...m,{role:"assistant",text:text2}]);
    } catch(e) { setMessages(m=>[...m,{role:"assistant",text:"Ошибка подключения."}]); }
    setLoading(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 120px)" }}>
      <div style={{ padding:"10px 16px 8px", borderBottom:`1px solid ${THEME.border}` }}>
        <div style={{ fontSize:14, fontWeight:"bold", color:THEME.text }}>🤖 ИИ-ментор по трейдингу</div>
        <div style={{ fontSize:11, color:THEME.subtext }}>Задай любой вопрос · Образовательные ответы</div>
      </div>
      {messages.length<=1&&(
        <div style={{ padding:"10px 16px 0", display:"flex", gap:6, flexWrap:"wrap" }}>
          {QUICK.map(q=><button key={q} onClick={()=>send(q)} style={{ padding:"5px 10px", borderRadius:14, border:`1px solid ${THEME.border}`, background:"transparent", color:THEME.subtext, fontSize:11, cursor:"pointer", fontFamily:"inherit", marginBottom:4 }}>{q}</button>)}
        </div>
      )}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {messages.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"88%", padding:"10px 14px", borderRadius:m.role==="user"?"16px 16px 4px 16px":"4px 16px 16px 16px",
              background:m.role==="user"?`linear-gradient(135deg,${THEME.accent},#3b6be0)`:THEME.card,
              border:m.role==="user"?"none":`1px solid ${THEME.border}`,
              color:m.role==="user"?"#fff":THEME.text, fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading&&<div style={{ display:"flex" }}><div style={{ padding:"10px 16px", borderRadius:"4px 16px 16px 16px", background:THEME.card, border:`1px solid ${THEME.border}`, color:THEME.subtext, fontSize:13 }}>📊 Анализирую...</div></div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{ padding:"10px 16px 14px", borderTop:`1px solid ${THEME.border}`, display:"flex", gap:8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&input.trim()&&send()} placeholder="Задай вопрос по трейдингу..."
          style={{ flex:1, padding:"11px 14px", background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:24, color:THEME.text, fontSize:14, outline:"none", fontFamily:"inherit" }}/>
        <button onClick={()=>send()} disabled={!input.trim()||loading} style={{ width:44, height:44, borderRadius:"50%", background:input.trim()&&!loading?`linear-gradient(135deg,${THEME.accent},#3b6be0)`:"#0d1a2e", border:"none", cursor:input.trim()&&!loading?"pointer":"default", fontSize:18, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>→</button>
      </div>
    </div>
  );
}

function GlossaryScreen() {
  const [search, setSearch] = useState("");
  const terms = [
    { term:"Ask", def:"Цена по которой брокер продаёт вам актив (цена покупки для трейдера)" },
    { term:"Bid", def:"Цена по которой брокер покупает у вас актив (цена продажи для трейдера)" },
    { term:"Spread", def:"Разница между Ask и Bid. Основной заработок брокера" },
    { term:"Pip/Пипс", def:"Минимальное изменение цены. EUR/USD: 0.0001, USD/JPY: 0.01" },
    { term:"Lot/Лот", def:"Единица объёма сделки. Стандарт=100,000 ед, Мини=10,000, Микро=1,000" },
    { term:"Leverage/Плечо", def:"Заёмные средства брокера. 1:100 = $1 своих контролирует $100" },
    { term:"Margin/Маржа", def:"Залог для открытия позиции с плечом" },
    { term:"Stop Loss", def:"Ордер для ограничения убытка. Закрывает позицию при достижении уровня" },
    { term:"Take Profit", def:"Ордер для фиксации прибыли. Закрывает позицию на целевом уровне" },
    { term:"Long", def:"Покупка актива в расчёте на рост цены" },
    { term:"Short", def:"Продажа актива в расчёте на падение цены" },
    { term:"Bullish/Бычий", def:"Рынок растёт. Быки толкают цену вверх (рогами)" },
    { term:"Bearish/Медвежий", def:"Рынок падает. Медведи давят цену вниз (лапой)" },
    { term:"Volatility", def:"Амплитуда колебаний цены. Высокая волатильность = большие движения" },
    { term:"Liquidity", def:"Лёгкость купли/продажи актива без сильного влияния на цену" },
    { term:"Support", def:"Уровень где покупатели активны. Цена отбивается вверх" },
    { term:"Resistance", def:"Уровень где продавцы активны. Цена отбивается вниз" },
    { term:"Trend", def:"Направленное движение цены. Вверх/вниз/боком" },
    { term:"Candlestick", def:"Японская свеча — тип графика показывающий Open,High,Low,Close" },
    { term:"RSI", def:"Relative Strength Index. Индикатор перекупленности (>70) и перепроданности (<30)" },
    { term:"MACD", def:"Moving Average Convergence Divergence. Индикатор тренда и импульса" },
    { term:"Fibonacci", def:"Уровни коррекции (38.2%, 50%, 61.8%). Используются для поиска точек входа" },
    { term:"BOS", def:"Break of Structure. Пробой предыдущего максимума/минимума. Подтверждение тренда" },
    { term:"Order Block", def:"Зона где институции разместили крупные ордера. Цена часто возвращается" },
    { term:"FVG", def:"Fair Value Gap. Ценовой имбаланс (пробел) который цена стремится заполнить" },
    { term:"Swap", def:"Комиссия за перенос позиции через ночь (ролловер)" },
    { term:"NFP", def:"Non-Farm Payrolls. Данные о занятости США. Выходит в 1-ю пятницу месяца" },
    { term:"DXY", def:"Индекс доллара США. Показывает силу доллара к корзине валют" },
    { term:"Hedge", def:"Страховочная позиция для снижения риска основной позиции" },
    { term:"Slippage", def:"Разница между ожидаемой и фактической ценой исполнения ордера" },
  ];
  const filtered = terms.filter(t=>!search||t.term.toLowerCase().includes(search.toLowerCase())||t.def.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding:"14px 16px", overflowY:"auto", maxHeight:"calc(100vh - 120px)" }}>
      <div style={{ fontSize:16, fontWeight:"bold", color:THEME.text, marginBottom:3 }}>📖 Глоссарий трейдера</div>
      <div style={{ fontSize:12, color:THEME.subtext, marginBottom:12 }}>{terms.length} терминов</div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Поиск термина..."
        style={{ width:"100%", padding:"10px 13px", background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:12, color:THEME.text, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit", marginBottom:12 }}/>
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {filtered.map((t,i)=>(
          <div key={i} style={{ background:THEME.card, border:`1px solid ${THEME.border}`, borderRadius:12, padding:"11px 14px" }}>
            <div style={{ fontSize:14, fontWeight:"bold", color:THEME.accent, marginBottom:4 }}>{t.term}</div>
            <div style={{ fontSize:13, color:THEME.text, lineHeight:1.6 }}>{t.def}</div>
          </div>
        ))}
        {filtered.length===0&&<div style={{ textAlign:"center", color:THEME.subtext, padding:30 }}>Ничего не найдено</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [sectionId, setSectionId] = useState(null);
  const [topicId, setTopicId] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tab, setTab] = useState("home");
  const [achievement, setAchievement] = useState(null);
  const [progress, setProgress] = useState(()=>load()||{});

  useEffect(()=>{ save(progress); },[progress]);
  useEffect(()=>{ const s=localStorage.getItem("tradepro_welcome"); if(!s){setShowWelcome(true);localStorage.setItem("tradepro_welcome","1");} },[]);

  function handleComplete(tid, score) {
    setProgress(p=>{
      const newP={...p,[tid]:{done:true,score}};
      const totalDone=Object.values(newP).filter(v=>v.done).length;
      if(totalDone===1) setAchievement("Первый урок пройден! 🎯");
      if(totalDone===5) setAchievement("5 тем изучено! Отличный старт!");
      if(totalDone===10) setAchievement("10 тем! Ты серьёзный трейдер!");
      return newP;
    });
  }

  function navigate(s, sid=null, tid=null) { setScreen(s); setSectionId(sid); setTopicId(tid); }

  function renderContent() {
    if(screen==="section"&&sectionId) return <SectionScreen sectionId={sectionId} progress={progress} onNavigate={navigate}/>;
    if(screen==="topic"&&sectionId&&topicId) return <TopicScreen sectionId={sectionId} topicId={topicId} onBack={()=>navigate("section",sectionId)} onComplete={handleComplete}/>;
    if(screen==="chartanalysis") return <ChartAnalysisScreen/>;
    if(screen==="mentor") return <MentorScreen/>;
    if(tab==="home") return <HomeScreen progress={progress} onNavigate={navigate}/>;
    if(tab==="glossary") return <GlossaryScreen/>;
    if(tab==="mentor") return <MentorScreen/>;
    return null;
  }

  const tabs=[{id:"home",icon:"📊",label:"Обучение"},{id:"mentor",icon:"🤖",label:"Ментор"},{id:"glossary",icon:"📖",label:"Глоссарий"}];

  return (
    <div style={{ minHeight:"100vh", background:THEME.bg, color:THEME.text, fontFamily:"'Georgia',serif", maxWidth:480, margin:"0 auto" }}>
      {showWelcome&&<WelcomeScreen onClose={()=>setShowWelcome(false)}/>}
      {achievement&&<AchievementPopup text={achievement} onClose={()=>setAchievement(null)}/>}

      <div style={{ background:"#060e1a", borderBottom:`1px solid ${THEME.border}`, padding:"11px 16px", display:"flex", alignItems:"center", gap:10 }}>
        {(screen!=="home"&&screen!=="mentor")||tab!=="home" ? (
          <button onClick={()=>{setScreen("home");setSectionId(null);setTopicId(null);}} style={{ background:"none", border:"none", color:THEME.accent, fontSize:18, cursor:"pointer", padding:0 }}>←</button>
        ) : null}
        <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#4f7ef7,#10b981)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>📊</div>
        <div>
          <div style={{ fontSize:14, fontWeight:"bold", color:THEME.text }}>TradePro</div>
          <div style={{ fontSize:10, color:THEME.subtext }}>Обучение трейдингу</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:7 }}>
          <button onClick={()=>setShowWelcome(true)} style={{ background:"none", border:`1px solid ${THEME.border}`, borderRadius:18, padding:"4px 9px", color:THEME.subtext, fontSize:14, cursor:"pointer" }}>?</button>
        </div>
      </div>

      <div style={{ paddingBottom:70 }}>{renderContent()}</div>

      {screen==="home"&&(
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"#060e1a", borderTop:`1px solid ${THEME.border}`, display:"flex" }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setScreen("home");}} style={{ flex:1, padding:"10px 0", background:"none", border:"none", cursor:"pointer", color:tab===t.id?THEME.accent:THEME.subtext, display:"flex", flexDirection:"column", alignItems:"center", gap:2, transition:"color 0.2s" }}>
              <span style={{ fontSize:19 }}>{t.icon}</span>
              <span style={{ fontSize:9, fontFamily:"inherit" }}>{t.label}</span>
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}*{box-sizing:border-box;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#1e2d45;}`}</style>
    </div>
  );
}
