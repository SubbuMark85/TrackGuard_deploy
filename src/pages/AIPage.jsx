import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AIService } from '../services/AIService';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Compass,
  Car,
  ChevronRight
} from 'lucide-react';

export const AIPage = () => {
  const { setActiveScreen } = useApp();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 Hi! I'm your TrackGuard AI Travel Companion. I analyze area safety scores, monitor family geofences, and curate family-friendly travel itineraries.",
      time: '10:00 AM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const samplePrompts = [
    "Plan a 2-day trip to Ooty",
    "Find safe places nearby",
    "What should I visit next?",
    "Take me back to the hotel",
    "Is this area safe?"
  ];

  const handleSendMessage = (queryText) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResult = AIService.getAIResponse(textToSend);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResult.text,
        type: aiResult.type,
        itinerary: aiResult.itinerary,
        destination: aiResult.destination,
        distance: aiResult.distance,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        handleSendMessage("Find safe places nearby");
      }, 3000);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      maxHeight: '780px',
      padding: '16px 16px 8px 16px',
      gap: '12px'
    }}>
      {/* Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #5BC0BE 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#090D16'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-family-title)', fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', lineHeight: 1 }}>
              AI Travel Companion
            </h2>
            <span style={{ fontSize: '0.68rem', color: '#5BC0BE' }}>
              Real-time Area Intelligence & Itineraries
            </span>
          </div>
        </div>

        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
          <Sparkles size={12} /> GPT-4 Travel Safety
        </span>
      </div>

      {/* Quick Prompt Pills Bar */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        padding: '4px 0',
        scrollbarWidth: 'none'
      }}>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              color: '#E5E7EB',
              borderRadius: 'var(--radius-full)',
              padding: '5px 12px',
              fontSize: '0.73rem',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Voice Assistant Visualizer Banner if active */}
      {isListening && (
        <div className="glass-panel" style={{
          padding: '12px',
          background: 'linear-gradient(90deg, rgba(91, 192, 190, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
          border: '1px solid var(--border-cyan)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ color: '#5BC0BE', animation: 'pulseDanger 1s infinite' }}>
              <Mic size={20} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#FFFFFF' }}>
              Listening to voice prompt...
            </span>
          </div>

          {/* Voice Wave Animation Bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  background: '#5BC0BE',
                  borderRadius: '2px',
                  animation: `waveBar 0.6s infinite ease-in-out ${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll View */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingRight: '4px'
      }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '90%',
                alignSelf: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                background: isUser
                  ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                  : 'rgba(30, 41, 59, 0.8)',
                color: '#FFFFFF',
                borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                padding: '12px 14px',
                fontSize: '0.85rem',
                border: isUser ? 'none' : '1px solid var(--border-subtle)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                whiteSpace: 'pre-line'
              }}>
                {msg.text}

                {/* Render Rich AI Itinerary Card if present */}
                {msg.itinerary && (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    padding: '12px',
                    marginTop: '10px',
                    border: '1px solid var(--border-cyan)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#5BC0BE', margin: 0 }}>
                        {msg.itinerary.title}
                      </h4>
                      <span className="badge badge-safe" style={{ fontSize: '0.65rem' }}>
                        Safety: {msg.itinerary.safetyScore}/100
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
                      <span><Clock size={12} inline /> {msg.itinerary.duration || msg.itinerary.distance}</span>
                      <span><Car size={12} inline /> {msg.itinerary.recommendedTransport}</span>
                    </div>

                    {/* Stops List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                      {msg.itinerary.stops.map((stop, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong style={{ color: '#FFFFFF' }}>{stop.name}</strong>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{stop.time}</div>
                          </div>
                          <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: '700' }}>
                            {stop.safety}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      className="btn btn-cyan"
                      onClick={() => setActiveScreen('navigation')}
                      style={{ marginTop: '4px', padding: '6px 10px', fontSize: '0.75rem' }}
                    >
                      Start Safe Nav Route <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* Render Navigation Action shortcut */}
                {msg.destination && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveScreen('navigation')}
                    style={{ marginTop: '8px', padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    Open GPS Navigation ({msg.distance}) <ChevronRight size={14} />
                  </button>
                )}
              </div>

              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', padding: '0 4px' }}>
                {msg.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input Bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={toggleVoice}
          style={{
            background: isListening ? '#EF4444' : 'rgba(255,255,255,0.08)',
            border: '1px solid var(--border-subtle)',
            color: isListening ? '#FFFFFF' : '#5BC0BE',
            borderRadius: '12px',
            padding: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Voice prompt assistant"
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask AI about trip safety, places, route..."
          style={{
            flex: 1,
            background: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '12px 14px',
            color: '#FFFFFF',
            fontSize: '0.88rem',
            outline: 'none'
          }}
        />

        <button
          className="btn btn-cyan"
          onClick={() => handleSendMessage()}
          style={{ padding: '12px 16px', borderRadius: '12px' }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
