import React, { useState } from 'react';
import { WelcomeModal } from './components/WelcomeModal';
import { SetupForm } from './components/SetupForm';
import { ProductionWorkspace } from './components/ProductionWorkspace';
import { ProductionPlan, AppState } from './types';
import { Language, languagePromptNames } from './lib/i18n';
import { Flow } from 'flow-sdk';
import { extractJson } from './lib/utils';

export default function App() {
  const [step, setStep] = useState<'welcome' | 'setup' | 'workspace'>('welcome');
  const [lang, setLang] = useState<Language>('vi');
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  
  const [appState, setAppState] = useState<AppState>({
    language: 'vi',
    productDescription: '',
    ideaDescription: '',
    productUrl: '',
    productImages: [],
    contextImages: [],
    decorImages: [],
    characterImage: null,
    characterDescription: '',
    dna: {
      features: '',
      benefits: '',
      dimensions: '',
      colors: '',
      materials: '',
      brandStyle: '',
      anatomyLocks: ''
    },
    settings: {
      duration: '30s',
      aspectRatio: '16:9',
      style: 'Realistic',
      category: 'Tổng hợp Nội thất',
      language: 'Vietnamese',
      toggles: {
        characters: true,
        textOnScreen: true,
        voiceOver: true,
        music: true
      }
    }
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    setAppState(prev => ({
      ...prev,
      language: newLang,
      settings: {
        ...prev.settings,
        language: languagePromptNames[newLang] || prev.settings.language
      }
    }));
  };

  const handleGeneratePlan = async (state: AppState) => {
    const activeLanguageName = languagePromptNames[state.language] || state.settings.language || 'Vietnamese';
    const updatedState = {
      ...state,
      settings: {
        ...state.settings,
        language: activeLanguageName
      }
    };
    setAppState(updatedState);
    
    const dnaContext = `
      LOCKED PRODUCT DNA:
      - Features: ${updatedState.dna.features || 'Standard'}
      - Benefits: ${updatedState.dna.benefits || 'High quality'}
      - Dimensions: ${updatedState.dna.dimensions || 'Life-size'}
      - Colors: ${updatedState.dna.colors || 'Natural'}
      - Materials: ${updatedState.dna.materials || 'Standard'}
      - Brand Style: ${updatedState.dna.brandStyle || 'Modern'}
      - Spatial Logic: ${updatedState.dna.anatomyLocks || 'Realistic human-scale'}
    `;

    const prompt = `
      Act as a Creative Director. Generate a detailed video storyboard plan for: ${updatedState.productDescription}.
      
      DNA CONSTRAINTS:
      ${dnaContext}

      PRODUCTION SETTINGS:
      - Category: ${updatedState.settings.category}
      - Visual Style: ${updatedState.settings.style}
      - Core Idea: ${updatedState.ideaDescription || 'Direct Showcase'}
      - Ref URL: ${updatedState.productUrl}
      - Total Duration: ${updatedState.settings.duration}
      - Aspect Ratio: ${updatedState.settings.aspectRatio}
      - Content Language: ${activeLanguageName}
      - Character Details: ${updatedState.characterDescription || 'None'}
      
      Requirements:
      1. 'description' field MUST be in English for stable image generation.
      2. 'dialog', 'visualCue', and 'title' MUST be in ${activeLanguageName}.
      3. Create 5-8 distinct shots that follow a cinematic flow.
      
      OUTPUT FORMAT (STRICT JSON ONLY):
      {
        "title": "A catchy production title",
        "shots": [
          {
            "id": "1",
            "type": "Wide Shot / Medium Shot / Close Up / Macro",
            "description": "Visual instruction in English focusing on product detail and DNA colors",
            "dialog": "Voiceover/Dialogue in ${activeLanguageName}",
            "visualCue": "On-screen text in ${activeLanguageName}",
            "timing": "3.5"
          }
        ]
      }
    `;

    try {
      // Giới hạn số lượng ảnh gửi lên để tránh lỗi payload quá lớn hoặc timeout
      const imagePayload = updatedState.productImages.slice(0, 3).map(img => ({ 
        base64: img.base64, 
        mimeType: img.mimeType 
      }));

      const { text } = await Flow.generate.text(prompt, {
        images: imagePayload,
        thinkingLevel: 'high', // Tăng độ suy luận để đảm bảo logic DNA được áp dụng vào từng cảnh
        systemInstruction: "You are a professional cinematographer. Return only a single valid JSON object. No markdown formatting outside the JSON block. Ensure spatial logic is preserved."
      });
      
      const generatedPlan = extractJson<ProductionPlan>(text);
      
      if (generatedPlan && Array.isArray(generatedPlan.shots) && generatedPlan.shots.length > 0) {
        setPlan(generatedPlan);
        setStep('workspace');
      } else {
        console.error("Malformed AI Response:", text);
        throw new Error("Phản hồi từ AI không đúng định dạng JSON hoặc thiếu dữ liệu cảnh quay.");
      }
    } catch (error) {
      console.error("Production Plan Generation Failed:", error);
      const errorMsg = lang === 'vi' 
        ? "Không thể tạo kế hoạch sản xuất. Lỗi: " + (error instanceof Error ? error.message : "AI bận hoặc phản hồi sai định dạng") 
        : "Failed to generate plan. Error: " + (error instanceof Error ? error.message : "AI timeout or format mismatch");
      alert(errorMsg);
      throw error; // Đẩy lỗi lại cho SetupForm để dừng trạng thái loading
    }
  };

  return (
    <div className="h-full w-full bg-[#0a0a0c] text-slate-200 overflow-hidden font-sans">
      {step === 'welcome' && (
        <WelcomeModal 
          onStart={() => setStep('setup')} 
          lang={lang} 
          onLangChange={handleLanguageChange} 
        />
      )}
      
      {step === 'setup' && (
        <SetupForm 
          initialState={appState} 
          onGenerate={handleGeneratePlan} 
          lang={lang}
          onLangChange={handleLanguageChange}
        />
      )}

      {step === 'workspace' && plan && (
        <ProductionWorkspace 
          plan={plan} 
          appState={appState}
          onBack={() => setStep('setup')}
          lang={lang}
          onLangChange={handleLanguageChange}
        />
      )}
    </div>
  );
}
