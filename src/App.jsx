import { useState, useEffect, useRef } from "react";
import { SECTIONS, SECTION_LIST, SIMULATOR_SCENARIOS, GLOSSARY } from "./courses.js";

function save(d) { try { localStorage.setItem("tp_v2", JSON.stringify(d)); } catch(e) {} }
function load() { try { const s=localStorage.getItem("tp_v2"); return s?JSON.parse(s):null; } catch(e) { return null; } }

const C = {
  bg:"#040810", panel:"#080f1c", card:"#0c1524", border:"#162035",
  border2:"#1e3050", text:"#c8d4e8", dim:"#4a6080", accent:"#2563eb",
  green:"#00c853", red:"#ff3d3d", yellow:"#ffd600", purple:"#9c27b0",
  orange:"#ff6d00", cyan:"#00bcd4"
};

// ── MINI CANDLESTICK SVG ──
function Candles({ data=[], h=80, w=280 }) {
  if(!data.length) return null;
  const highs=data.map(d=>d.h), lows=data.map(d=>d.l);
  const max=Math.max(...highs), min=Math.min(...lows), range=max-min||1;
  const cw=w/data.length;
  const py=v=>h-((v-min)/range)*(h-4)-2;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
      {data.map((d,i)=>{
        const bull=d.c>=d.o; const col=bull?C.green:C.red;
        const cx=i*cw+cw/2, x=i*cw+cw*0.15, bw=cw*0.7;
        const top=py(Math.max(d.o,d.c)), bot=py(Math.min(d.o,d.c)), bh=Math.max(bot-top,1);
        return <g key={i}>
          <line x1={cx} y1={py(d.h)} x2={cx} y2={py(d.l)} stroke={col} strokeWidth="1"/>
          <rect x={x} y={top} width={bw} height={bh} fill={col}/>
        </g>;
      })}
    </svg>
  );
}

// ── LINE CHART ──
function LineChart({ data=[], color=C.green, h=50 }) {
  if(data.length<2) return null;
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const w=200, pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*(h-4)-2}`).join(" ");
  return <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{display:"block"}}>
    <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

// ── TICKER ──
const TICKERS = [
  {sym:"XAU/USD",price:2318.50,chg:+0.82,col:C.yellow},
  {sym:"EUR/USD",price:1.0842,chg:-0.15,col:C.cyan},
  {sym:"BTC/USD",price:67420,chg:+2.34,col:C.orange},
  {sym:"GBP/USD",price:1.2698,chg:+0.21,col:"#7c4dff"},
  {sym:"ETH/USD",price:3521,chg:-0.88,col:"#536dfe"},
  {sym:"NVDA",price:887.5,chg:+3.12,col:C.green},
  {sym:"S&P 500",price:5287,chg:+0.45,col:C.cyan},
  {sym:"USD/JPY",price:154.82,chg:-0.31,col:"#ff80ab"},
];

function TickerBar() {
  const [off, setOff] = useState(0);
  useEffect(()=>{ const t=setInterval(()=>setOff(o=>o-1),30); return()=>clearInterval(t); },[]);
  const row = [...TICKERS,...TICKERS];
  return (
    <div style={{overflow:"hidden",background:"#050c18",borderBottom:`1px solid ${C.border}`,height:32,display:"flex",alignItems:"center"}}>
      <div style={{display:"flex",gap:0,transform:`translateX(${off % (TICKERS.length*140)}px)`,transition:"none",whiteSpace:"nowrap"}}>
        {row.map((t,i)=>(
          <span key={i} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"0 16px",fontSize:11,borderRight:`1px solid ${C.border}`,height:32}}>
            <span style={{color:t.col,fontWeight:"bold"}}>{t.sym}</span>
            <span style={{color:C.text}}>{t.price}</span>
            <span style={{color:t.chg>=0?C.green:C.red}}>{t.chg>=0?"+":""}{t.chg}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── CALCULATOR ──
function Calculator() {
  const [dep,setDep]=useState("1000");
  const [risk,setRisk]=useState("1");
  const [sl,setSl]=useState("20");
  const [entry,setEntry]=useState("2310");
  const [tp,setTp]=useState("40");

  const riskAmt = parseFloat(dep)*parseFloat(risk)/100 || 0;
  const pipVal = riskAmt/parseFloat(sl) || 0;
  const rrRatio = parseFloat(tp)/parseFloat(sl) || 0;
  const potProfit = riskAmt*rrRatio;
  const slPrice = parseFloat(entry)-parseFloat(sl)*0.01;
  const tpPrice = parseFloat(entry)+parseFloat(tp)*0.01;
  const rrColor = rrRatio>=2?C.green:rrRatio>=1?C.yellow:C.red;

  const inp = {width:"100%",padding:"9px 12px",background:C.panel,border:`1px solid ${C.border2}`,borderRadius:8,color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"monospace"};

  return (
    <div style={{padding:"14px 16px",overflowY:"auto",maxHeight:"calc(100vh - 120px)"}}>
      <div style={{fontSize:16,fontWeight:"bold",color:C.text,marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
        <span style={{color:C.yellow}}>⚡</span> Калькулятор позиции
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[
          {label:"Депозит ($)",val:dep,set:setDep,ph:"1000"},
          {label:"Риск (%)",val:risk,set:setRisk,ph:"1"},
          {label:"Stop Loss (пипс)",val:sl,set:setSl,ph:"20"},
          {label:"Цена входа",val:entry,set:setEntry,ph:"2310"},
          {label:"Take Profit (пипс)",val:tp,set:setTp,ph:"40"},
        ].map(f=>(
          <div key={f.label}>
            <div style={{fontSize:11,color:C.dim,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{f.label}</div>
            <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={inp}/>
          </div>
        ))}
      </div>

      {/* Results */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[
          {label:"Сумма риска",val:`$${riskAmt.toFixed(2)}`,col:C.red},
          {label:"Стоимость пипса",val:`$${pipVal.toFixed(2)}/пип`,col:C.cyan},
          {label:"SL уровень",val:slPrice.toFixed(2),col:C.red},
          {label:"TP уровень",val:tpPrice.toFixed(2),col:C.green},
          {label:"Risk/Reward",val:`1 : ${rrRatio.toFixed(1)}`,col:rrColor},
          {label:"Потенц. прибыль",val:`$${potProfit.toFixed(2)}`,col:C.green},
        ].map(r=>(
          <div key={r.label} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:10,color:C.dim,marginBottom:3,textTransform:"uppercase"}}>{r.label}</div>
            <div style={{fontSize:16,fontWeight:"bold",color:r.col,fontFamily:"monospace"}}>{r.val}</div>
          </div>
        ))}
      </div>

      {/* RR Warning */}
      <div style={{background:rrRatio>=2?"rgba(0,200,83,0.08)":rrRatio>=1?"rgba(255,214,0,0.08)":"rgba(255,61,61,0.08)",border:`1px solid ${rrColor}30`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:rrColor}}>
        {rrRatio>=2?"✅ Хорошее R:R. Сделка соответствует профессиональным стандартам.":rrRatio>=1?"⚠️ Минимальное R:R. Рекомендуется минимум 1:2.":"❌ Плохое R:R. Не рекомендуется открывать сделку с таким соотношением."}
      </div>

      <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:12,padding:14,fontSize:12,color:C.dim,lineHeight:1.7}}>
        📌 <strong style={{color:C.text}}>Формулы:</strong><br/>
        Сумма риска = Депозит × Риск%<br/>
        Стоимость пипса = Сумма риска ÷ SL (пипс)<br/>
        R:R = TP ÷ SL<br/>
        Прибыль = Сумма риска × R:R
      </div>
    </div>
  );
}

// ── SIMULATOR ──
function Simulator({ onXP }) {
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState({});
  const sc = SIMULATOR_SCENARIOS[idx];

  function choose(optId) {
    if(chosen) return;
    setChosen(optId);
    if(optId===sc.correct) onXP(50);
    else onXP(10);
  }

  function next() {
    setDone(d=>({...d,[sc.id]:chosen===sc.correct}));
    setChosen(null);
    setIdx(i=>(i+1)%SIMULATOR_SCENARIOS.length);
  }

  const opt = sc.options.find(o=>o.id===chosen);
  const isCorrect = chosen===sc.correct;

  return (
    <div style={{padding:"14px 16px",overflowY:"auto",maxHeight:"calc(100vh - 120px)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:16,fontWeight:"bold",color:C.text,display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.green}}>🎮</span> Симулятор сделок
        </div>
        <div style={{fontSize:12,color:C.dim}}>{idx+1}/{SIMULATOR_SCENARIOS.length}</div>
      </div>

      <div style={{background:C.panel,border:`1px solid ${C.border2}`,borderRadius:14,padding:14,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:14,fontWeight:"bold",color:C.yellow}}>{sc.instrument}</span>
          <span style={{fontSize:12,color:C.dim,background:C.card,padding:"2px 8px",borderRadius:6}}>{sc.timeframe}</span>
        </div>
        <div style={{marginBottom:10,borderRadius:8,overflow:"hidden"}}>
          <Candles data={sc.candles} h={120}/>
        </div>
        <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>{sc.description}</div>
      </div>

      <div style={{fontSize:14,fontWeight:"bold",color:C.text,marginBottom:10}}>{sc.question}</div>

      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
        {sc.options.map(o=>{
          const isSel=chosen===o.id;
          const isCorr=chosen&&o.id===sc.correct;
          const isWrong=chosen&&isSel&&o.id!==sc.correct;
          return (
            <button key={o.id} onClick={()=>choose(o.id)} style={{padding:"12px 16px",borderRadius:12,border:`2px solid ${isCorr?C.green:isWrong?C.red:isSel?C.accent:C.border2}`,background:isCorr?"rgba(0,200,83,0.1)":isWrong?"rgba(255,61,61,0.1)":isSel?`${C.accent}15`:C.panel,color:isCorr?C.green:isWrong?C.red:C.text,textAlign:"left",cursor:chosen?"default":"pointer",fontSize:14,fontFamily:"inherit",fontWeight:"bold",transition:"all 0.2s"}}>
              {o.label}
            </button>
          );
        })}
      </div>

      {chosen&&(
        <div>
          <div style={{background:isCorrect?"rgba(0,200,83,0.08)":"rgba(255,61,61,0.08)",border:`1px solid ${isCorrect?C.green:C.red}30`,borderRadius:12,padding:14,marginBottom:10}}>
            <div style={{fontSize:13,color:isCorrect?C.green:C.red,marginBottom:6,fontWeight:"bold"}}>{isCorrect?"🎯 Правильно! +50 XP":"📚 Неверно. +10 XP за попытку"}</div>
            <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>{opt?.explanation}</div>
          </div>
          <div style={{background:"rgba(37,99,235,0.08)",border:`1px solid ${C.accent}30`,borderRadius:12,padding:12,marginBottom:10,fontSize:12,color:C.dim}}>
            📊 {sc.result}
          </div>
          <button onClick={next} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${C.accent},#1d4ed8)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,cursor:"pointer",fontFamily:"inherit",fontWeight:"bold"}}>
            Следующий сценарий →
          </button>
        </div>
      )}
    </div>
  );
}

// ── WELCOME ──
function Welcome({ onClose }) {
  const [step,setStep]=useState(0);
  const steps=[
    {icon:"📊",title:"TradePro Terminal",text:"Профессиональная платформа для обучения трейдингу. Форекс, крипто, акции, продвинутые стратегии."},
    {icon:"🎮",title:"Симулятор сделок",text:"Тренируйся на реальных рыночных сценариях. Принимай решения — видь результат. Безопасно и эффективно."},
    {icon:"⚡",title:"Калькулятор позиции",text:"Рассчитывай размер лота, R:R и потенциальную прибыль. Профессиональный инструмент управления рисками."},
    {icon:"📸",title:"Анализ чарта ИИ",text:"Сделай скриншот любого чарта → ИИ проанализирует тренд, паттерны, уровни и даст торговые идеи."},
    {icon:"⚠️",title:"Важно",text:"Трейдинг — высокий риск потери капитала. Всё содержимое носит образовательный характер и не является финансовой рекомендацией."},
  ];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:22,padding:28,maxWidth:360,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{fontSize:52,marginBottom:10}}>{steps[step].icon}</div>
          <div style={{fontSize:19,fontWeight:"bold",color:C.text,marginBottom:8}}>{steps[step].title}</div>
          <div style={{fontSize:13,color:C.dim,lineHeight:1.7}}>{steps[step].text}</div>
        </div>
        <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:20}}>
          {steps.map((_,i)=><div key={i} style={{width:i===step?22:8,height:8,borderRadius:4,background:i===step?C.accent:C.border,transition:"all 0.3s"}}/>)}
        </div>
        <div style={{display:"flex",gap:10}}>
          {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:12,background:"transparent",border:`1px solid ${C.border2}`,borderRadius:12,color:C.dim,cursor:"pointer",fontFamily:"inherit"}}>← Назад</button>}
          <button onClick={()=>step<steps.length-1?setStep(s=>s+1):onClose()} style={{flex:1,padding:12,background:`linear-gradient(135deg,${C.accent},#1d4ed8)`,border:"none",borderRadius:12,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:"bold"}}>
            {step<steps.length-1?"Далее →":"К терминалу 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── HOME ──
function HomeScreen({ progress, onNavigate, xp }) {
  const totalDone=SECTION_LIST.reduce((a,s)=>a+SECTIONS[s].topics.filter(t=>progress[t.id]?.done).length,0);
  const totalTopics=SECTION_LIST.reduce((a,s)=>a+SECTIONS[s].topics.length,0);
  const btcData=[55,58,62,59,57,61,68,65,63,67];

  return (
    <div style={{padding:"14px 16px",overflowY:"auto",maxHeight:"calc(100vh - 120px)"}}>
      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {l:"Прогресс",v:`${totalDone}/${totalTopics}`,c:C.accent,i:"📚"},
          {l:"XP",v:xp,c:C.yellow,i:"⚡"},
          {l:"Завершено",v:`${Math.round(totalDone/totalTopics*100)}%`,c:C.green,i:"🎯"},
        ].map((s,i)=>(
          <div key={i} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 12px",textAlign:"center"}}>
            <div style={{fontSize:18}}>{s.i}</div>
            <div style={{fontSize:18,fontWeight:"bold",color:s.c,fontFamily:"monospace"}}>{s.v}</div>
            <div style={{fontSize:10,color:C.dim,textTransform:"uppercase"}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Mini market panel */}
      <div style={{background:C.panel,border:`1px solid ${C.border2}`,borderRadius:14,padding:14,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div>
            <div style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1}}>XAU/USD</div>
            <div style={{fontSize:22,fontWeight:"bold",color:C.yellow,fontFamily:"monospace"}}>2,318.50</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:13,color:C.green,fontWeight:"bold"}}>▲ +18.90 (+0.82%)</div>
            <div style={{fontSize:11,color:C.dim}}>Демо · Обновлено</div>
          </div>
        </div>
        <LineChart data={btcData} color={C.yellow}/>
      </div>

      {/* Quick actions */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[
          {icon:"🎮",label:"Симулятор",sub:"Практика сделок",nav:"simulator",col:C.green},
          {icon:"⚡",label:"Калькулятор",sub:"Размер позиции",nav:"calc",col:C.yellow},
          {icon:"📸",label:"Анализ чарта",sub:"ИИ разбор",nav:"chartai",col:"#9c27b0"},
          {icon:"🤖",label:"ИИ-ментор",sub:"Задай вопрос",nav:"mentor",col:C.accent},
        ].map(a=>(
          <button key={a.nav} onClick={()=>onNavigate(a.nav)} style={{background:C.panel,border:`1px solid ${C.border2}`,borderRadius:14,padding:"13px 14px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=a.col}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border2}>
            <div style={{fontSize:24,marginBottom:5}}>{a.icon}</div>
            <div style={{fontSize:13,fontWeight:"bold",color:C.text}}>{a.label}</div>
            <div style={{fontSize:11,color:C.dim}}>{a.sub}</div>
          </button>
        ))}
      </div>

      {/* Sections */}
      <div style={{fontSize:11,color:C.dim,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Разделы обучения</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {SECTION_LIST.map(sid=>{
          const s=SECTIONS[sid];
          const done=s.topics.filter(t=>progress[t.id]?.done).length;
          const pct=Math.round(done/s.topics.length*100);
          return (
            <button key={sid} onClick={()=>onNavigate("section",sid)} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:13,padding:"12px 14px",textAlign:"left",cursor:"pointer",color:C.text,display:"flex",alignItems:"center",gap:12,transition:"all 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=s.color}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{width:40,height:40,borderRadius:10,background:`${s.color}18`,border:`1px solid ${s.color}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:"bold",marginBottom:3}}>{s.title}</div>
                <div style={{background:C.border,borderRadius:3,height:4,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:s.color,borderRadius:3,transition:"width 0.5s"}}/>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:13,color:s.color,fontWeight:"bold",fontFamily:"monospace"}}>{pct}%</div>
                <div style={{fontSize:10,color:C.dim}}>{done}/{s.topics.length}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{margin:"14px 0 4px",background:"rgba(255,61,61,0.06)",border:"1px solid rgba(255,61,61,0.15)",borderRadius:10,padding:"10px 13px",fontSize:11,color:"#ff6b6b",lineHeight:1.6}}>
        ⚠️ Образовательная платформа. Не является финансовой рекомендацией. Трейдинг связан с риском потери капитала.
      </div>
    </div>
  );
}

// ── SECTION ──
function SectionScreen({ sid, progress, onNavigate }) {
  const s=SECTIONS[sid];
  const demoCandles=[
    {o:100,h:108,l:97,c:105},{o:105,h:112,l:103,c:110},{o:110,h:115,l:106,c:108},
    {o:108,h:110,l:102,c:104},{o:104,h:108,l:100,c:107},{o:107,h:118,l:105,c:115},
    {o:115,h:122,l:112,c:120},{o:120,h:126,l:116,c:123},
  ];
  return (
    <div style={{padding:"14px 16px",overflowY:"auto",maxHeight:"calc(100vh - 120px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <div style={{width:46,height:46,borderRadius:13,background:`${s.color}18`,border:`1px solid ${s.color}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{s.icon}</div>
        <div>
          <div style={{fontSize:18,fontWeight:"bold",color:C.text}}>{s.title}</div>
          <div style={{fontSize:12,color:C.dim}}>{s.topics.length} тем · {s.description}</div>
        </div>
      </div>
      <div style={{marginBottom:14,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
        <Candles data={demoCandles} h={110}/>
        <div style={{background:C.panel,padding:"6px 12px",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:11,color:C.dim}}>Демо чарт · {s.title}</span>
          <span style={{fontSize:11,color:C.green}}>▲ +2.3%</span>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {s.topics.map((topic,idx)=>{
          const done=progress[topic.id]?.done;
          const score=progress[topic.id]?.score;
          const locked=idx>0&&!s.topics.slice(0,idx).every(t=>progress[t.id]?.done);
          return (
            <button key={topic.id} onClick={()=>!locked&&onNavigate("topic",sid,topic.id)} style={{background:C.panel,border:`2px solid ${done?C.green:locked?C.border:C.border2}`,borderRadius:13,padding:"13px 15px",textAlign:"left",cursor:locked?"not-allowed":"pointer",color:C.text,display:"flex",alignItems:"center",gap:12,opacity:locked?0.45:1,transition:"all 0.2s"}}
              onMouseEnter={e=>!locked&&(e.currentTarget.style.borderColor=s.color)}
              onMouseLeave={e=>e.currentTarget.style.borderColor=done?C.green:locked?C.border:C.border2}>
              <div style={{width:42,height:42,borderRadius:11,background:done?`rgba(0,200,83,0.15)`:locked?C.card:`${s.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                {locked?"🔒":done?"✅":topic.emoji}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:"bold",marginBottom:3}}>{topic.title}</div>
                <span style={{fontSize:11,background:`${s.color}20`,color:s.color,padding:"2px 8px",borderRadius:8}}>{topic.level}</span>
                {done&&<span style={{fontSize:11,color:C.green,marginLeft:8}}>✓ {score}%</span>}
              </div>
              {!locked&&<span style={{color:done?C.green:s.color,fontSize:16}}>→</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── TOPIC ──
function TopicScreen({ sid, topicId, onBack, onComplete }) {
  const s=SECTIONS[sid]; const topic=s.topics.find(t=>t.id===topicId);
  const [phase,setPhase]=useState("learn");
  const [qIdx,setQIdx]=useState(0); const [sel,setSel]=useState(null);
  const [checked,setChecked]=useState(false); const [correct,setCorrect]=useState(0);

  if(!topic) return null;
  const q=topic.quiz[qIdx];

  function check() { setChecked(true); if(sel===q.answer) setCorrect(c=>c+1); }
  function next() {
    const isLast=qIdx>=topic.quiz.length-1;
    const fc=correct+(sel===q.answer?1:0);
    if(isLast){ const sc=Math.round(fc/topic.quiz.length*100); setPhase("result"); onComplete(topic.id,sc); }
    else { setQIdx(q=>q+1); setSel(null); setChecked(false); }
  }

  if(phase==="learn") return (
    <div style={{padding:"14px 16px",overflowY:"auto",maxHeight:"calc(100vh - 120px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <span style={{fontSize:28}}>{topic.emoji}</span>
        <div>
          <div style={{fontSize:15,fontWeight:"bold",color:C.text}}>{topic.title}</div>
          <span style={{fontSize:11,background:`${s.color}20`,color:s.color,padding:"2px 8px",borderRadius:8}}>{topic.level}</span>
        </div>
      </div>
      <div style={{background:C.panel,border:`1px solid ${C.border2}`,borderRadius:14,padding:16,marginBottom:14}}>
        <div style={{fontSize:13,color:C.text,lineHeight:2.0,whiteSpace:"pre-line"}}>{topic.content}</div>
      </div>
      <button onClick={()=>setPhase("quiz")} style={{width:"100%",padding:14,background:`linear-gradient(135deg,${s.color},${s.color}cc)`,border:"none",borderRadius:13,color:"#fff",fontSize:15,cursor:"pointer",fontFamily:"inherit",fontWeight:"bold"}}>
        Пройти тест ({topic.quiz.length} вопроса) →
      </button>
    </div>
  );

  if(phase==="quiz") return (
    <div style={{padding:"14px 16px",overflowY:"auto",maxHeight:"calc(100vh - 120px)"}}>
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:13,fontWeight:"bold",color:C.text}}>Вопрос {qIdx+1}/{topic.quiz.length}</span>
          <span style={{fontSize:12,color:C.green,fontFamily:"monospace"}}>✓ {correct}</span>
        </div>
        <div style={{background:C.border,borderRadius:4,height:5,overflow:"hidden"}}>
          <div style={{width:`${(qIdx/topic.quiz.length)*100}%`,height:"100%",background:s.color,borderRadius:4}}/>
        </div>
      </div>
      <div style={{background:C.panel,border:`1px solid ${C.border2}`,borderRadius:14,padding:15,marginBottom:12}}>
        <div style={{fontSize:15,color:C.text,fontWeight:"500",lineHeight:1.6}}>{q.q}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
        {q.options.map(opt=>{
          const isSel=sel===opt; const isCorr=checked&&opt===q.answer; const isWrong=checked&&isSel&&opt!==q.answer;
          return <button key={opt} onClick={()=>!checked&&setSel(opt)} style={{padding:"12px 15px",borderRadius:12,border:`2px solid ${isCorr?C.green:isWrong?C.red:isSel?s.color:C.border2}`,background:isCorr?"rgba(0,200,83,0.1)":isWrong?"rgba(255,61,61,0.1)":isSel?`${s.color}15`:C.panel,color:isCorr?C.green:isWrong?C.red:C.text,textAlign:"left",cursor:checked?"default":"pointer",fontSize:13,fontFamily:"inherit",transition:"all 0.15s"}}>{opt}</button>;
        })}
      </div>
      {checked&&q.explanation&&(
        <div style={{background:`${C.accent}10`,border:`1px solid ${C.accent}30`,borderRadius:12,padding:13,marginBottom:12}}>
          <div style={{fontSize:11,color:C.accent,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>💡 Объяснение</div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>{q.explanation}</div>
        </div>
      )}
      {!checked ? (
        <button onClick={check} disabled={!sel} style={{width:"100%",padding:13,background:sel?`linear-gradient(135deg,${s.color},${s.color}cc)`:C.card,border:"none",borderRadius:12,color:"#fff",fontSize:15,cursor:sel?"pointer":"not-allowed",fontFamily:"inherit",fontWeight:"bold"}}>Проверить</button>
      ) : (
        <button onClick={next} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${s.color},${s.color}cc)`,border:"none",borderRadius:12,color:"#fff",fontSize:15,cursor:"pointer",fontFamily:"inherit",fontWeight:"bold"}}>
          {qIdx<topic.quiz.length-1?"Следующий →":"Завершить ✓"}
        </button>
      )}
    </div>
  );

  const fc=correct+(sel===q.answer?1:0);
  const sc=Math.round(fc/topic.quiz.length*100);
  return (
    <div style={{padding:"14px 16px",overflowY:"auto",maxHeight:"calc(100vh - 120px)"}}>
      <div style={{textAlign:"center",padding:"20px 0 16px"}}>
        <div style={{fontSize:56,marginBottom:10}}>{sc>=80?"🏆":sc>=60?"👍":"📚"}</div>
        <div style={{fontSize:28,fontWeight:"bold",color:C.text,fontFamily:"monospace",marginBottom:4}}>{sc}%</div>
        <div style={{fontSize:14,color:C.dim}}>{fc} из {topic.quiz.length} верных</div>
        <div style={{marginTop:10,fontSize:13,color:sc>=80?C.green:sc>=60?C.yellow:C.red}}>
          {sc>=80?"✅ Тема пройдена! Открыт следующий урок.":sc>=60?"👍 Неплохо! Повтори для закрепления.":"📖 Перечитай теорию и попробуй снова."}
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>{setPhase("learn");setQIdx(0);setSel(null);setChecked(false);setCorrect(0);}} style={{flex:1,padding:13,background:"transparent",border:`1px solid ${C.border2}`,borderRadius:12,color:C.dim,cursor:"pointer",fontFamily:"inherit"}}>🔄 Повторить</button>
        <button onClick={onBack} style={{flex:1,padding:13,background:`linear-gradient(135deg,${s.color},${s.color}cc)`,border:"none",borderRadius:12,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:"bold"}}>← К разделу</button>
      </div>
    </div>
  );
}

// ── CHART AI ──
function ChartAI() {
  const [img,setImg]=useState(null); const [res,setRes]=useState(null);
  const [loading,setLoading]=useState(false); const [err,setErr]=useState(null);
  const ref=useRef(null);

  async function analyze(file) {
    setLoading(true); setRes(null); setErr(null);
    try {
      const b64=await new Promise((r,j)=>{ const rd=new FileReader(); rd.onload=()=>r(rd.result.split(",")[1]); rd.onerror=()=>j(new Error("Ошибка")); rd.readAsDataURL(file); });
      const resp=await fetch("/api/chat",{ method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:900,
          system:`Ты опытный трейдер-аналитик. Анализируй торговый чарт детально. Отвечай только JSON без markdown:
{"instrument":"инструмент","timeframe":"таймфрейм","trend":"бычий/медвежий/боковой","strength":"сильный/средний/слабый","patterns":["паттерн1"],"support":"уровень","resistance":"уровень","rsi_est":"примерный RSI если видно","signal":"ПОКУПКА/ПРОДАЖА/НЕЙТРАЛЬНО","entry":"примерная зона входа","sl":"примерный стоп-лосс","tp":"примерный тейк-профит","forecast":"прогноз 2-3 предложения","risks":"ключевые риски","confidence":"уверенность 0-100%"}`,
          messages:[{role:"user",content:[
            {type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:b64}},
            {type:"text",text:"Проанализируй этот торговый чарт. Дай детальный технический анализ в JSON."}
          ]}]
        })
      });
      const data=await resp.json();
      const text=data.content?.map(b=>b.text||"").join("")||"";
      try { setRes(JSON.parse(text.replace(/```json|```/g,"").trim())); }
      catch(e) { setErr("Не удалось разобрать ответ. Попробуй другой скриншот."); }
    } catch(e) { setErr("Ошибка: "+e.message); }
    setLoading(false);
  }

  function handleFile(e) {
    const f=e.target.files[0]; if(!f) return;
    e.target.value=""; setImg(URL.createObjectURL(f)); setRes(null); analyze(f);
  }

  const sigCol=res?.signal?.includes("ПОКУПКА")?C.green:res?.signal?.includes("ПРОДАЖА")?C.red:C.yellow;

  return (
    <div style={{padding:"14px 16px",overflowY:"auto",maxHeight:"calc(100vh - 120px)"}}>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:16,fontWeight:"bold",color:C.text,marginBottom:3,display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"#9c27b0"}}>📸</span> Анализ чарта — ИИ
        </div>
        <div style={{fontSize:12,color:C.dim,lineHeight:1.6}}>Загрузи скриншот из MT4/MT5, TradingView, Binance → ИИ проанализирует всё.</div>
      </div>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
      <button onClick={()=>ref.current.click()} style={{width:"100%",padding:15,background:"linear-gradient(135deg,#9c27b0,#7b1fa2)",border:"none",borderRadius:13,color:"#fff",fontSize:15,cursor:"pointer",fontFamily:"inherit",fontWeight:"bold",marginBottom:12}}>
        📊 Загрузить скриншот чарта
      </button>
      {img&&(
        <div style={{marginBottom:12,borderRadius:13,overflow:"hidden",border:`2px solid ${C.border2}`,position:"relative"}}>
          <img src={img} alt="chart" style={{width:"100%",maxHeight:220,objectFit:"cover",display:"block"}}/>
          {loading&&<div style={{position:"absolute",inset:0,background:"rgba(4,8,16,0.8)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
            <div style={{fontSize:32}}>🔍</div>
            <div style={{color:C.text,fontSize:14,fontWeight:"bold"}}>Анализирую...</div>
            <div style={{fontSize:12,color:C.dim}}>Тренд · Паттерны · Уровни</div>
          </div>}
        </div>
      )}
      {res&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:`${sigCol}12`,border:`2px solid ${sigCol}40`,borderRadius:15,padding:16,textAlign:"center"}}>
            <div style={{fontSize:11,color:C.dim,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Торговый сигнал</div>
            <div style={{fontSize:24,fontWeight:"bold",color:sigCol,fontFamily:"monospace"}}>{res.signal}</div>
            <div style={{fontSize:12,color:C.dim,marginTop:4}}>{res.instrument} · {res.timeframe} · Уверенность: {res.confidence}</div>
          </div>
          <div style={{background:C.panel,border:`1px solid ${C.border2}`,borderRadius:13,padding:14}}>
            <div style={{fontSize:11,color:C.dim,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>📈 Анализ</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {l:"Тренд",v:res.trend,c:C.accent},
                {l:"Сила",v:res.strength,c:C.cyan},
                {l:"Поддержка",v:res.support,c:C.green},
                {l:"Сопротивление",v:res.resistance,c:C.red},
                {l:"Вход",v:res.entry,c:C.yellow},
                {l:"Stop Loss",v:res.sl,c:C.red},
                {l:"Take Profit",v:res.tp,c:C.green},
                {l:"RSI ~",v:res.rsi_est||"—",c:C.cyan},
              ].map(r=>(
                <div key={r.l} style={{background:C.card,borderRadius:9,padding:"8px 10px"}}>
                  <div style={{fontSize:10,color:C.dim,textTransform:"uppercase"}}>{r.l}</div>
                  <div style={{fontSize:13,fontWeight:"bold",color:r.c,fontFamily:"monospace"}}>{r.v||"—"}</div>
                </div>
              ))}
            </div>
          </div>
          {res.patterns?.length>0&&(
            <div style={{background:C.panel,border:`1px solid ${C.border2}`,borderRadius:13,padding:13}}>
              <div style={{fontSize:11,color:C.dim,marginBottom:7,textTransform:"uppercase",letterSpacing:1}}>🕯️ Паттерны</div>
              {res.patterns.map((p,i)=><div key={i} style={{fontSize:13,color:C.text,marginBottom:3}}>• {p}</div>)}
            </div>
          )}
          {res.forecast&&(
            <div style={{background:`${C.accent}08`,border:`1px solid ${C.accent}25`,borderRadius:13,padding:13}}>
              <div style={{fontSize:11,color:C.accent,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>🔮 Прогноз</div>
              <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{res.forecast}</div>
            </div>
          )}
          {res.risks&&(
            <div style={{background:"rgba(255,61,61,0.06)",border:"1px solid rgba(255,61,61,0.2)",borderRadius:13,padding:13}}>
              <div style={{fontSize:11,color:C.red,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>⚠️ Риски</div>
              <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{res.risks}</div>
            </div>
          )}
          <div style={{fontSize:11,color:C.dim,textAlign:"center"}}>⚠️ Анализ носит образовательный характер</div>
          <button onClick={()=>{setImg(null);setRes(null);}} style={{padding:12,background:"transparent",border:`1px solid ${C.border2}`,borderRadius:12,color:C.dim,cursor:"pointer",fontFamily:"inherit",fontSize:13}}>📸 Другой чарт</button>
        </div>
      )}
      {err&&<div style={{background:"rgba(255,61,61,0.08)",border:"1px solid rgba(255,61,61,0.3)",borderRadius:12,padding:13,color:C.red,fontSize:13}}>❌ {err}</div>}
      {!img&&!loading&&(
        <div style={{textAlign:"center",padding:"24px 0",color:C.dim}}>
          <div style={{fontSize:52,marginBottom:12}}>📊</div>
          <div style={{fontSize:13,lineHeight:1.9}}>Загрузи скриншот чарта из<br/>MT4, MT5, TradingView, Binance<br/>или любого торгового приложения</div>
        </div>
      )}
    </div>
  );
}

// ── MENTOR ──
function Mentor() {
  const [msgs,setMsgs]=useState([{role:"assistant",text:"Привет! Я ИИ-ментор по трейдингу 📊\n\nСпрашивай о стратегиях, индикаторах, риск-менеджменте, психологии — объясню простым языком с примерами на XAU/USD, EUR/USD, BTC/USD."}]);
  const [input,setInput]=useState(""); const [loading,setLoading]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{ ref.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);
  const QUICK=["Что такое RSI и как его использовать?","Объясни уровни Фибоначчи","Как рассчитать размер позиции?","Разница: свинг-трейдинг vs дэй-трейдинг","Что такое Order Block (ICT)?","Как торговать на новостях NFP?"];

  async function send(text) {
    const msg=text||input.trim(); if(!msg||loading) return;
    setInput(""); setMsgs(m=>[...m,{role:"user",text:msg}]); setLoading(true);
    try {
      const hist=msgs.slice(-8).map(m=>({role:m.role==="assistant"?"assistant":"user",content:m.text}));
      const resp=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:700,
          system:`Ты опытный трейдер и наставник. Отвечаешь на вопросы по трейдингу по-русски.
Правила: объясняй простым языком с конкретными примерами (XAU/USD, EUR/USD, BTC/USD). Используй эмодзи. Максимум 200 слов. Напоминай о рисках. НЕ давай конкретных "купи/продай". В конце задай вопрос.`,
          messages:[...hist,{role:"user",content:msg}]
        })
      });
      const data=await resp.json();
      setMsgs(m=>[...m,{role:"assistant",text:data.content?.map(b=>b.text||"").join("").trim()||"Ошибка"}]);
    } catch(e) { setMsgs(m=>[...m,{role:"assistant",text:"Ошибка подключения."}]); }
    setLoading(false);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
      <div style={{padding:"10px 16px 8px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:14,fontWeight:"bold",color:C.text}}>🤖 ИИ-ментор</div>
        <div style={{fontSize:11,color:C.dim}}>Обучение трейдингу · Только образовательные ответы</div>
      </div>
      {msgs.length<=1&&<div style={{padding:"10px 16px 0",display:"flex",gap:6,flexWrap:"wrap"}}>
        {QUICK.map(q=><button key={q} onClick={()=>send(q)} style={{padding:"5px 10px",borderRadius:12,border:`1px solid ${C.border2}`,background:"transparent",color:C.dim,fontSize:11,cursor:"pointer",fontFamily:"inherit",marginBottom:4}}>{q}</button>)}
      </div>}
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"88%",padding:"10px 14px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"4px 16px 16px 16px",background:m.role==="user"?`linear-gradient(135deg,${C.accent},#1d4ed8)`:C.panel,border:m.role==="user"?"none":`1px solid ${C.border2}`,color:m.role==="user"?"#fff":C.text,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
              {m.text}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex"}}><div style={{padding:"10px 16px",borderRadius:"4px 16px 16px 16px",background:C.panel,border:`1px solid ${C.border2}`,color:C.dim,fontSize:13}}>📊 Анализирую...</div></div>}
        <div ref={ref}/>
      </div>
      <div style={{padding:"10px 16px 14px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&input.trim()&&send()} placeholder="Вопрос по трейдингу..."
          style={{flex:1,padding:"11px 14px",background:C.panel,border:`1px solid ${C.border2}`,borderRadius:24,color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
        <button onClick={()=>send()} disabled={!input.trim()||loading} style={{width:44,height:44,borderRadius:"50%",background:input.trim()&&!loading?`linear-gradient(135deg,${C.accent},#1d4ed8)`:C.card,border:"none",cursor:input.trim()&&!loading?"pointer":"default",fontSize:18,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>
      </div>
    </div>
  );
}

// ── GLOSSARY ──
function GlossaryScreen() {
  const [search,setSearch]=useState("");
  const filtered=GLOSSARY.filter(t=>!search||t.term.toLowerCase().includes(search.toLowerCase())||t.def.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{padding:"14px 16px",overflowY:"auto",maxHeight:"calc(100vh - 120px)"}}>
      <div style={{fontSize:16,fontWeight:"bold",color:C.text,marginBottom:3}}>📖 Глоссарий</div>
      <div style={{fontSize:12,color:C.dim,marginBottom:12}}>{GLOSSARY.length} терминов трейдера</div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Поиск термина..."
        style={{width:"100%",padding:"10px 13px",background:C.panel,border:`1px solid ${C.border2}`,borderRadius:12,color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:12}}/>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {filtered.map((t,i)=>(
          <div key={i} style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:11,padding:"11px 14px"}}>
            <div style={{fontSize:14,fontWeight:"bold",color:C.accent,marginBottom:3,fontFamily:"monospace"}}>{t.term}</div>
            <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>{t.def}</div>
          </div>
        ))}
        {!filtered.length&&<div style={{textAlign:"center",color:C.dim,padding:30}}>Ничего не найдено</div>}
      </div>
    </div>
  );
}

// ── APP ──
export default function App() {
  const [screen,setScreen]=useState("home");
  const [sid,setSid]=useState(null); const [tid,setTid]=useState(null);
  const [showWelcome,setShowWelcome]=useState(false);
  const [tab,setTab]=useState("home");
  const [progress,setProgress]=useState(()=>load()||{});
  const [xp,setXp]=useState(()=>{ try{return parseInt(localStorage.getItem("tp_xp")||"0")}catch{return 0}});
  const [popup,setPopup]=useState(null);

  useEffect(()=>{ save(progress); },[progress]);
  useEffect(()=>{ try{localStorage.setItem("tp_xp",xp);}catch{} },[xp]);
  useEffect(()=>{ const s=localStorage.getItem("tp_welcome"); if(!s){setShowWelcome(true);localStorage.setItem("tp_welcome","1");} },[]);

  function addXp(n) {
    setXp(x=>{ const nw=x+n; if(nw>=100&&x<100) setPopup("100 XP! Ты на верном пути! 🚀"); if(nw>=500&&x<500) setPopup("500 XP! Настоящий трейдер! 💎"); return nw; });
  }

  function handleComplete(topicId, score) {
    setProgress(p=>({...p,[topicId]:{done:true,score}}));
    addXp(score>=80?100:score>=60?60:30);
    const total=Object.keys(progress).length+1;
    if(total===1) setPopup("Первый урок пройден! +XP 🎯");
    if(total===5) setPopup("5 уроков! Отличный прогресс! 📚");
  }

  function navigate(s, s2=null, t=null) { setScreen(s); setSid(s2); setTid(t); }

  function renderContent() {
    if(screen==="section"&&sid) return <SectionScreen sid={sid} progress={progress} onNavigate={navigate}/>;
    if(screen==="topic"&&sid&&tid) return <TopicScreen sid={sid} topicId={tid} onBack={()=>navigate("section",sid)} onComplete={handleComplete}/>;
    if(screen==="simulator") return <Simulator onXP={addXp}/>;
    if(screen==="calc") return <Calculator/>;
    if(screen==="chartai") return <ChartAI/>;
    if(screen==="mentor") return <Mentor/>;
    if(tab==="home") return <HomeScreen progress={progress} onNavigate={navigate} xp={xp}/>;
    if(tab==="glossary") return <GlossaryScreen/>;
    if(tab==="mentor") return <Mentor/>;
    return null;
  }

  const tabs=[{id:"home",icon:"📊",label:"Главная"},{id:"mentor",icon:"🤖",label:"Ментор"},{id:"glossary",icon:"📖",label:"Глоссарий"}];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Courier New',monospace",maxWidth:480,margin:"0 auto"}}>
      {showWelcome&&<Welcome onClose={()=>setShowWelcome(false)}/>}
      {popup&&(
        <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:999,background:"linear-gradient(135deg,#1a1040,#0d0820)",border:`1px solid ${C.yellow}`,borderRadius:16,padding:"13px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:`0 8px 32px ${C.yellow}30`,animation:"slideDown 0.4s ease",maxWidth:320,width:"90%"}}>
          <span style={{fontSize:28}}>⚡</span>
          <div><div style={{fontSize:11,color:C.yellow,textTransform:"uppercase",letterSpacing:1}}>Достижение!</div><div style={{fontSize:14,fontWeight:"bold",color:"#fff"}}>{popup}</div></div>
          <button onClick={()=>setPopup(null)} style={{marginLeft:"auto",background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:18}}>×</button>
        </div>
      )}

      {/* Header */}
      <div style={{background:"#050c18",borderBottom:`1px solid ${C.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
        {screen!=="home"&&<button onClick={()=>{setScreen("home");setSid(null);setTid(null);}} style={{background:"none",border:"none",color:C.accent,fontSize:18,cursor:"pointer",padding:0}}>←</button>}
        <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${C.accent},${C.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📊</div>
        <div>
          <div style={{fontSize:13,fontWeight:"bold",color:C.text,letterSpacing:1}}>TRADEPRO</div>
          <div style={{fontSize:9,color:C.dim,letterSpacing:2,textTransform:"uppercase"}}>Trading Education Terminal</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          <div style={{background:C.panel,border:`1px solid ${C.border2}`,borderRadius:8,padding:"4px 10px",fontSize:12,color:C.yellow,fontFamily:"monospace"}}>⚡{xp} XP</div>
          <button onClick={()=>setShowWelcome(true)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 8px",color:C.dim,fontSize:13,cursor:"pointer"}}>?</button>
        </div>
      </div>

      <TickerBar/>

      <div style={{paddingBottom:70}}>{renderContent()}</div>

      {screen==="home"&&(
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#050c18",borderTop:`1px solid ${C.border}`,display:"flex"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 0",background:"none",border:"none",cursor:"pointer",color:tab===t.id?C.accent:C.dim,display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"color 0.2s"}}>
              <span style={{fontSize:19}}>{t.icon}</span>
              <span style={{fontSize:9,fontFamily:"inherit",textTransform:"uppercase",letterSpacing:1}}>{t.label}</span>
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}*{box-sizing:border-box;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#162035;}`}</style>
    </div>
  );
}
