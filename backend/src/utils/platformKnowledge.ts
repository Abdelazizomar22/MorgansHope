export const PLATFORM_KNOWLEDGE = {
  identity: [
    "Morgan's Hope is a graduation-project web platform for AI-assisted chest imaging screening support.",
    "Abdelaziz Omar is the project idea owner and is responsible for developing the website experience, integrating the platform services, and building/preparing the AI models used by the project.",
    "The platform supports awareness, preliminary screening, report understanding, and safer follow-up guidance. It never provides a final medical diagnosis.",
    "The name is inspired by Arthur Morgan from Red Dead Redemption 2 and his tuberculosis story. The project uses that story as a symbol for early awareness and a second chance for every breath.",
  ],
  pages: [
    "Home: explains early detection, CT and X-Ray support, image validation, report generation, urgency level, guided follow-up, current AI coverage, and the platform vision.",
    "Upload & Analyze: authenticated users upload JPG, PNG, or WebP chest CT/X-Ray images up to 10MB. Local file checks run first, then backend validation verifies that the image matches the selected scan type before analysis.",
    "Results: shows the latest analysis and history, groups batch uploads by session, displays urgency, findings, next-step guidance, optional CT nodule/TB localization boxes, and downloadable PDF reports.",
    "AI Assistant: authenticated chat assistant that uses the user's profile, recent analysis, conversation memory, and platform knowledge to explain results and guide next steps safely.",
    "Hospitals: guidance directory for chest, oncology, imaging, biopsy, chemotherapy, radiation, thoracic surgery, and follow-up care in Egypt. Filters include city, care type, sector, and availability.",
    "About: explains the graduation-project purpose, Arthur Morgan inspiration, human-centered screening experience, and the long-term vision for broader chest imaging support.",
    "Contact: lets users contact the team for questions and support.",
    "Authentication and onboarding: users create an account, review Medical Use & Consent, verify email for local accounts, and may optionally add profile information such as phone, age, gender, and smoking history.",
    "Privacy and legal pages: explain collected account data, uploaded scan data, analysis history, assistant messages, security practices, and medical-use limitations.",
  ],
  aiModels: [
    "Validation Gate model: EfficientNet-B0 pre-classification gate that checks whether an upload is Chest_CT, Chest_XRay, Non_Medical, or Other_Medical before disease analysis.",
    "CT classification model: EfficientNetB3 lung-cancer classifier for CT images. Classes are Normal, Benign, Adenocarcinoma, Large Cell Carcinoma, Squamous Cell Carcinoma, and Malignant General.",
    "Chest X-Ray clinical groups model: NIH ChestX-ray14 based multi-label clinical grouping pipeline. Groups are Pulmonary Infection, COPD-related Findings, Fibrotic Lung Disease, Cardiac Conditions, Potential Malignancy Findings, Pleural Diseases, and No Finding.",
    "TB screening model: Chest X-Ray tuberculosis signal model that runs alongside the X-Ray clinical grouping pipeline.",
    "Localization model: produces visual focus regions when available, including CT nodule localization and TB lesion localization support.",
  ],
  analysisFlow: [
    "1. User chooses X-Ray or CT and uploads one or more images.",
    "2. Frontend checks type and size, then calls the validation endpoint.",
    "3. Backend stores private scan references and queues/executes analysis with timeout and retry protections.",
    "4. Unified Hugging Face AI service receives the request and lazy-loads the required model to stay compatible with free-tier resources.",
    "5. Result is normalized by the backend into classification, clinical group, urgency, findings, next step, and optional localization data.",
    "6. Results page and PDF report present AI-assisted screening output with clear medical disclaimers.",
  ],
  servicesAndDeployment: [
    "Frontend: React with TypeScript and Vite, deployed on Vercel.",
    "Backend: Node.js and Express TypeScript API deployed on Vercel serverless functions.",
    "Database: PostgreSQL through Supabase, with Supabase private storage for medical scan objects.",
    "AI service: Python/FastAPI unified Hugging Face Space at the configured AI_SERVICES_URL.",
    "Background jobs: QStash worker endpoint handles asynchronous analysis jobs when configured.",
    "Chat providers: the assistant can use Groq, OpenRouter, or Gemini API keys, then falls back to deterministic local replies if providers are unavailable.",
  ],
  hospitals: [
    "Hospital guidance is for follow-up support only. Users must confirm services, booking, contact details, and availability directly with the hospital.",
    "Cities currently represented include Cairo, Giza / 6th of October, Alexandria, Mansoura, and Assiut.",
    "Care filters include lung cancer care, chest medicine/pulmonology, thoracic surgery, medical oncology, radiation oncology, chemotherapy, bronchoscopy/biopsy, CT/imaging support, PET-CT/advanced imaging, and supportive care.",
    "Example hospitals include National Cancer Institute Cairo University, Ain Shams University Hospitals Clinical Oncology & Nuclear Medicine, Dar Al Fouad Hospital, South Egypt Cancer Institute Assiut University, Mansoura University Oncology Center, Alexandria University Hospital chest services, As-Salam International Hospital, and Kasr Al Ainy Chest Department.",
  ],
  safetyRules: [
    "Use the phrase AI-assisted screening support, not AI diagnosis.",
    "Never claim final diagnosis, guaranteed accuracy, medication dosing, or treatment plans.",
    "Always remind users that qualified physician review is required before medical decisions.",
    "For severe chest pain, severe shortness of breath, coughing blood, fainting, confusion, or blue lips, advise emergency services immediately.",
    "If a user asks whether the platform replaces a doctor, answer clearly that it does not.",
    "If uncertain or outside scope, explain the limitation and suggest medical review or platform navigation help.",
  ],
  freeTierNotes: [
    "The deployed AI service is designed around free-tier constraints by lazy-loading models instead of preloading all models at startup.",
    "Cold starts can make the first analysis slower, especially on Hugging Face free Spaces.",
    "The backend uses longer timeouts/retries and asynchronous worker support to reduce false service-unavailable errors.",
  ],
};

export function buildPlatformKnowledgePrompt() {
  return [
    "-- Morgan's Hope Platform Knowledge Base --",
    "Identity:",
    ...PLATFORM_KNOWLEDGE.identity.map((item) => `- ${item}`),
    "Pages and user flows:",
    ...PLATFORM_KNOWLEDGE.pages.map((item) => `- ${item}`),
    "Current AI models and scope:",
    ...PLATFORM_KNOWLEDGE.aiModels.map((item) => `- ${item}`),
    "Analysis pipeline:",
    ...PLATFORM_KNOWLEDGE.analysisFlow.map((item) => `- ${item}`),
    "Services and deployment:",
    ...PLATFORM_KNOWLEDGE.servicesAndDeployment.map((item) => `- ${item}`),
    "Hospital guidance:",
    ...PLATFORM_KNOWLEDGE.hospitals.map((item) => `- ${item}`),
    "Safety and content rules:",
    ...PLATFORM_KNOWLEDGE.safetyRules.map((item) => `- ${item}`),
    "Free-tier deployment notes:",
    ...PLATFORM_KNOWLEDGE.freeTierNotes.map((item) => `- ${item}`),
  ].join("\n");
}

export function getPlatformHelpFallback(ar: boolean) {
  if (ar) {
    return [
      "I can help you use Morgan's Hope this way:",
      "- Upload & Analyze: sign in, complete consent, then upload a Chest CT or Chest X-Ray image.",
      "- Results: review the classification, urgency level, next step, optional localization, and PDF report.",
      "- AI Assistant: ask about your latest result, classification meaning, or what to discuss with a doctor.",
      "- Hospitals: filter Egypt hospital guidance by city, care type, sector, and contact availability.",
      "Important: Morgan's Hope provides AI-assisted screening support only, not a final diagnosis.",
    ].join("\n");
  }

  return [
    "I can help you use Morgan's Hope this way:",
    "- Upload & Analyze: sign in, complete consent, then upload a Chest CT or Chest X-Ray image.",
    "- Results: review the classification, urgency level, next step, optional localization, and PDF report.",
    "- AI Assistant: ask about your latest result, classification meaning, or what to discuss with a doctor.",
    "- Hospitals: filter Egypt hospital guidance by city, care type, sector, and contact availability.",
    "Important: Morgan's Hope provides AI-assisted screening support only, not a final diagnosis.",
  ].join("\n");
}
