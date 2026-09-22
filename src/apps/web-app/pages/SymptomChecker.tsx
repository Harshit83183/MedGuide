import MedGuideResumeResult from '../components/MedGuideResumeResult';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareText,
  ImagePlus,
  Mic,
  MicOff,
  X,
  ArrowRight,
  Loader2,
  Paperclip,
  Volume2
} from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import {
  useLanguage,
  type Lang
} from '../lib/language';
import {
  uploadFile,
  type SessionUser
} from '../lib/api';

const HINTS: Record<Lang, string> = {
  en: 'e.g. I have had fever and body pain for 2 days...',
  hi: 'उदा. मुझे 2 दिन से बुखार और बदन दर्द है...',
  hinglish:
    'e.g. Mujhe 2 din se bukhar hai, gala bhi kharab hai...',
  mr: 'उदा. मला 2 दिवसांपासून ताप आहे...',
  ta: 'உதா. எனக்கு 2 நாட்களாக காய்ச்சல் மற்றும் உடல்வலி உள்ளது...',
  bn: 'উদা. আমার ২ দিন ধরে জ্বর ও শরীর ব্যথা আছে...'
};

const LABEL: Record<Lang, string> = {
  en: 'Describe your problem in your own words',
  hi: 'अपनी तकलीफ अपने शब्दों में बताएं',
  hinglish:
    'Apni takleef apne shabdon me batayein',
  mr: 'तुमची तक्रार तुमच्या शब्दांत सांगा',
  ta: 'உங்கள் பிரச்சினையை உங்கள் சொற்களில் கூறுங்கள்',
  bn: 'আপনার সমস্যা নিজের ভাষায় বলুন'
};

const LOCAL_ERRORS: Record<
  Lang,
  {
    fileTooLarge: string;
    uploadFailed: string;
    audioConvertFailed: string;
    audioReadFailed: string;
    voiceInvalidResponse: string;
    voiceNotUnderstood: string;
    noClearSpeech: string;
    micUnsupported: string;
    recordingFailed: string;
    recordingTooShort: string;
    voiceUnclear: string;
    voiceProcessFailed: string;
    micPermission: string;
    micAccess: string;
    attachmentNeedsText: string;
  }
> = {
  en: {
    fileTooLarge:
      'is larger than 3 MB. Please choose a smaller file.',
    uploadFailed: 'Upload failed. Please try again.',
    audioConvertFailed:
      'The audio could not be converted.',
    audioReadFailed:
      'The audio could not be read.',
    voiceInvalidResponse:
      'Voice transcription did not return a valid response.',
    voiceNotUnderstood:
      'The voice could not be understood.',
    noClearSpeech:
      'No clear speech was detected. Please speak clearly and try again.',
    micUnsupported:
      'Your browser does not support microphone recording.',
    recordingFailed:
      'There was a problem while recording. Please try again.',
    recordingTooShort:
      'The recording is too short. Please speak clearly for a few seconds and try again.',
    voiceUnclear:
      'The voice was not clear. Please try again.',
    voiceProcessFailed:
      'The voice note could not be processed.',
    micPermission:
      'Microphone permission was not granted. Please allow microphone access in your browser.',
    micAccess:
      'Microphone access is unavailable. Please check your browser permission and microphone.',
    attachmentNeedsText:
      'Photos, documents and voice notes can be uploaded, but Smart Triage does not currently analyse their medical content directly. Please describe your problem in at least 10 characters.'
  },

  hi: {
    fileTooLarge:
      '3 MB से बड़ा है। कृपया छोटी फाइल चुनें।',
    uploadFailed:
      'अपलोड विफल हो गया। कृपया दोबारा प्रयास करें।',
    audioConvertFailed:
      'ऑडियो को परिवर्तित नहीं किया जा सका।',
    audioReadFailed:
      'ऑडियो को पढ़ा नहीं जा सका।',
    voiceInvalidResponse:
      'वॉइस ट्रांसक्रिप्शन से सही प्रतिक्रिया नहीं मिली।',
    voiceNotUnderstood:
      'आवाज़ को समझा नहीं जा सका।',
    noClearSpeech:
      'स्पष्ट आवाज़ नहीं मिली। कृपया साफ़ बोलकर दोबारा प्रयास करें।',
    micUnsupported:
      'आपका ब्राउज़र माइक्रोफोन रिकॉर्डिंग का समर्थन नहीं करता।',
    recordingFailed:
      'रिकॉर्डिंग में समस्या आई। कृपया दोबारा प्रयास करें।',
    recordingTooShort:
      'रिकॉर्डिंग बहुत छोटी है। कुछ सेकंड साफ़ बोलकर दोबारा प्रयास करें।',
    voiceUnclear:
      'आवाज़ स्पष्ट नहीं थी। कृपया दोबारा प्रयास करें।',
    voiceProcessFailed:
      'वॉइस नोट को प्रोसेस नहीं किया जा सका।',
    micPermission:
      'माइक्रोफोन की अनुमति नहीं मिली। कृपया ब्राउज़र में माइक्रोफोन की अनुमति दें।',
    micAccess:
      'माइक्रोफोन उपलब्ध नहीं है। कृपया ब्राउज़र की अनुमति और माइक्रोफोन जांचें।',
    attachmentNeedsText:
      'फोटो, दस्तावेज़ और वॉइस नोट अपलोड किए जा सकते हैं, लेकिन स्मार्ट ट्रायेज अभी उनकी चिकित्सकीय सामग्री का सीधे विश्लेषण नहीं करता। कृपया अपनी समस्या कम से कम 10 अक्षरों में लिखें।'
  },

  hinglish: {
    fileTooLarge:
      '3 MB se bada hai — chhoti file chunein.',
    uploadFailed:
      'Upload fail ho gaya. Dobara try karein.',
    audioConvertFailed:
      'Audio convert nahi ho saka.',
    audioReadFailed:
      'Audio read nahi ho saka.',
    voiceInvalidResponse:
      'Voice transcription se valid response nahi mila.',
    voiceNotUnderstood:
      'Voice samajh nahi aayi.',
    noClearSpeech:
      'Voice me clear speech detect nahi hui. Dobara clearly bolkar try karein.',
    micUnsupported:
      'Aapka browser microphone recording support nahi karta.',
    recordingFailed:
      'Voice recording me problem aayi. Dobara try karein.',
    recordingTooShort:
      'Recording bahut chhoti hai. Kam se kam kuch seconds clearly bolkar try karein.',
    voiceUnclear:
      'Voice clear nahi thi. Dobara try karein.',
    voiceProcessFailed:
      'Voice process nahi ho saki.',
    micPermission:
      'Mic permission nahi mili. Browser me microphone permission Allow karein.',
    micAccess:
      'Mic access nahi mila. Browser permission aur microphone check karein.',
    attachmentNeedsText:
      'Photo, document aur voice note abhi upload ho sakte hain, lekin Smart Triage unki medical content ko abhi directly analyse nahi karta. Kripya apni takleef kam se kam 10 aksharon me likhein.'
  },

  mr: {
    fileTooLarge:
      '3 MB पेक्षा मोठी आहे. कृपया लहान फाइल निवडा.',
    uploadFailed:
      'अपलोड अयशस्वी झाले. पुन्हा प्रयत्न करा.',
    audioConvertFailed:
      'ऑडिओ रूपांतरित करता आला नाही.',
    audioReadFailed:
      'ऑडिओ वाचता आला नाही.',
    voiceInvalidResponse:
      'व्हॉइस ट्रान्सक्रिप्शनकडून वैध प्रतिसाद मिळाला नाही.',
    voiceNotUnderstood:
      'आवाज समजू शकला नाही.',
    noClearSpeech:
      'स्पष्ट आवाज आढळला नाही. कृपया स्पष्ट बोलून पुन्हा प्रयत्न करा.',
    micUnsupported:
      'तुमचा ब्राउझर मायक्रोफोन रेकॉर्डिंगला समर्थन देत नाही.',
    recordingFailed:
      'रेकॉर्डिंगमध्ये समस्या आली. पुन्हा प्रयत्न करा.',
    recordingTooShort:
      'रेकॉर्डिंग खूप लहान आहे. काही सेकंद स्पष्ट बोलून पुन्हा प्रयत्न करा.',
    voiceUnclear:
      'आवाज स्पष्ट नव्हता. पुन्हा प्रयत्न करा.',
    voiceProcessFailed:
      'व्हॉइस नोट प्रक्रिया करता आली नाही.',
    micPermission:
      'मायक्रोफोनची परवानगी मिळाली नाही. कृपया ब्राउझरमध्ये मायक्रोफोनची परवानगी द्या.',
    micAccess:
      'मायक्रोफोन उपलब्ध नाही. कृपया ब्राउझरची परवानगी आणि मायक्रोफोन तपासा.',
    attachmentNeedsText:
      'फोटो, दस्तऐवज आणि व्हॉइस नोट अपलोड करता येतात, परंतु स्मार्ट ट्रायेज सध्या त्यांच्या वैद्यकीय मजकुराचे थेट विश्लेषण करत नाही. कृपया तुमची समस्या किमान 10 अक्षरांत लिहा.'
  },

  ta: {
    fileTooLarge:
      '3 MB-ஐ விட பெரியது. சிறிய கோப்பைத் தேர்ந்தெடுக்கவும்.',
    uploadFailed:
      'பதிவேற்றம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
    audioConvertFailed:
      'ஆடியோவை மாற்ற முடியவில்லை.',
    audioReadFailed:
      'ஆடியோவை படிக்க முடியவில்லை.',
    voiceInvalidResponse:
      'குரல் உரைமாற்றத்திலிருந்து சரியான பதில் கிடைக்கவில்லை.',
    voiceNotUnderstood:
      'குரலை புரிந்துகொள்ள முடியவில்லை.',
    noClearSpeech:
      'தெளிவான பேச்சு கண்டறியப்படவில்லை. தெளிவாகப் பேசி மீண்டும் முயற்சிக்கவும்.',
    micUnsupported:
      'உங்கள் உலாவி மைக்ரோஃபோன் பதிவை ஆதரிக்கவில்லை.',
    recordingFailed:
      'குரல் பதிவில் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
    recordingTooShort:
      'பதிவு மிகவும் குறுகியது. சில விநாடிகள் தெளிவாகப் பேசி மீண்டும் முயற்சிக்கவும்.',
    voiceUnclear:
      'குரல் தெளிவாக இல்லை. மீண்டும் முயற்சிக்கவும்.',
    voiceProcessFailed:
      'குரல் குறிப்பை செயலாக்க முடியவில்லை.',
    micPermission:
      'மைக்ரோஃபோன் அனுமதி கிடைக்கவில்லை. உலாவியில் அனுமதியை வழங்கவும்.',
    micAccess:
      'மைக்ரோஃபோனை அணுக முடியவில்லை. உலாவி அனுமதியையும் மைக்ரோஃபோனையும் சரிபார்க்கவும்.',
    attachmentNeedsText:
      'புகைப்படம், ஆவணம் மற்றும் குரல் குறிப்பை பதிவேற்றலாம். ஆனால் ஸ்மார்ட் டிரையாஜ் தற்போது அவற்றின் மருத்துவ உள்ளடக்கத்தை நேரடியாக பகுப்பாய்வு செய்யாது. உங்கள் பிரச்சினையை குறைந்தது 10 எழுத்துகளில் எழுதுங்கள்.'
  },

  bn: {
    fileTooLarge:
      '3 MB-এর চেয়ে বড়। অনুগ্রহ করে ছোট ফাইল নির্বাচন করুন।',
    uploadFailed:
      'আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
    audioConvertFailed:
      'অডিও রূপান্তর করা যায়নি।',
    audioReadFailed:
      'অডিও পড়া যায়নি।',
    voiceInvalidResponse:
      'ভয়েস ট্রান্সক্রিপশন থেকে সঠিক উত্তর পাওয়া যায়নি।',
    voiceNotUnderstood:
      'কণ্ঠস্বর বোঝা যায়নি।',
    noClearSpeech:
      'স্পষ্ট কথা শনাক্ত হয়নি। পরিষ্কারভাবে বলে আবার চেষ্টা করুন।',
    micUnsupported:
      'আপনার ব্রাউজার মাইক্রোফোন রেকর্ডিং সমর্থন করে না।',
    recordingFailed:
      'রেকর্ডিংয়ে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    recordingTooShort:
      'রেকর্ডিং খুব ছোট। কয়েক সেকেন্ড পরিষ্কারভাবে বলে আবার চেষ্টা করুন।',
    voiceUnclear:
      'কণ্ঠস্বর স্পষ্ট ছিল না। আবার চেষ্টা করুন।',
    voiceProcessFailed:
      'ভয়েস নোট প্রসেস করা যায়নি।',
    micPermission:
      'মাইক্রোফোনের অনুমতি পাওয়া যায়নি। ব্রাউজারে মাইক্রোফোনের অনুমতি দিন।',
    micAccess:
      'মাইক্রোফোন ব্যবহার করা যাচ্ছে না। ব্রাউজারের অনুমতি এবং মাইক্রোফোন পরীক্ষা করুন।',
    attachmentNeedsText:
      'ছবি, ডকুমেন্ট এবং ভয়েস নোট আপলোড করা যায়, কিন্তু স্মার্ট ট্রায়াজ বর্তমানে সেগুলোর চিকিৎসাবিষয়ক বিষয়বস্তু সরাসরি বিশ্লেষণ করে না। আপনার সমস্যা কমপক্ষে ১০ অক্ষরে লিখুন।'
  }
};

type UploadedFile = {
  url?: string;
  name: string;
  kind: 'image' | 'audio' | 'doc';
  preview?: string;
};

type PossibleCause = {
  name: string;
  relevance: 'low' | 'moderate' | 'strong';
  reason: string;
};

type TriageResult = {
  urgency: 'green' | 'yellow' | 'red';
  urgencyTitle: string;
  summary: string;
  possibleCauses: PossibleCause[];
  detectedSymptoms: string[];
  importantContext: string[];
  redFlags: string[];
  recommendations: string[];
  selfCare: string[];
  doctorAdvice: string[];
  emergencyAdvice: string[];
  followUpQuestions: string[];
  needsMoreInformation: boolean;
  disclaimer: string;
};

type TriageResponse = {
  success: boolean;
  provider: string;
  model: string;
  result: TriageResult;
  error?: string;
};

export default function SymptomChecker({
  user
}: {
  user: SessionUser;
}) {
  const nav = useNavigate();
  const { lang, tr } = useLanguage();

  const [text, setText] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const imgRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const messages = LOCAL_ERRORS[lang];

  const addFiles = async (
    list: FileList | null,
    kind: 'image' | 'doc'
  ) => {
    if (!list || list.length === 0) {
      return;
    }

    setErr('');
    setUploading(true);

    try {
      for (const file of Array.from(list).slice(0, 3)) {
        if (file.size > 3 * 1024 * 1024) {
          setErr(`"${file.name}" ${messages.fileTooLarge}`);
          continue;
        }

        const preview =
          kind === 'image'
            ? URL.createObjectURL(file)
            : undefined;

        const url = await uploadFile(
          file,
          `symptoms/${user.id}`
        );

        setFiles((previous) => [
          ...previous,
          {
            url,
            name: file.name,
            kind,
            preview
          }
        ]);
      }
    } catch {
      setErr(messages.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const blobToBase64 = (
    blob: Blob
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = String(reader.result || '');

        const base64 = result.includes(',')
          ? result.split(',')[1]
          : result;

        if (!base64) {
          reject(
            new Error(messages.audioConvertFailed)
          );
          return;
        }

        resolve(base64);
      };

      reader.onerror = () => {
        reject(
          new Error(messages.audioReadFailed)
        );
      };

      reader.readAsDataURL(blob);
    });
  };

  const transcribeVoice = async (blob: Blob) => {
    const audio = await blobToBase64(blob);

    const response = await fetch(
      '/api/voice-transcribe',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio,
          mimeType: blob.type || 'audio/webm',
          language: lang
        })
      }
    );

    let data: {
      success?: boolean;
      transcript?: string;
      error?: string;
      model?: string;
    };

    try {
      data = await response.json();
    } catch {
      throw new Error(
        messages.voiceInvalidResponse
      );
    }

    if (!response.ok) {
      throw new Error(messages.voiceNotUnderstood);
    }

    const transcript = String(
      data.transcript || ''
    ).trim();

    if (!transcript) {
      throw new Error(messages.noClearSpeech);
    }

    setText((previous) => {
      const current = previous.trim();

      if (!current) {
        return transcript;
      }

      return `${current} ${transcript}`;
    });

    return transcript;
  };

  const toggleRec = async () => {
    if (recording) {
      mediaRef.current?.stop();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setRecording(false);
      return;
    }

    try {
      setErr('');

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setErr(messages.micUnsupported);
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      let mimeType = '';

      if (
        MediaRecorder.isTypeSupported(
          'audio/webm;codecs=opus'
        )
      ) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (
        MediaRecorder.isTypeSupported('audio/webm')
      ) {
        mimeType = 'audio/webm';
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        setRecording(false);
        setUploading(false);
        setErr(messages.recordingFailed);
      };

      recorder.onstop = async () => {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const duration = recSecs;

        const actualMime =
          recorder.mimeType || 'audio/webm';

        const blob = new Blob(
          chunksRef.current,
          {
            type: actualMime
          }
        );

        chunksRef.current = [];

        if (blob.size < 1000) {
          setErr(messages.recordingTooShort);
          setRecSecs(0);
          return;
        }

        const file = new File(
          [blob],
          `voice-${Date.now()}.webm`,
          {
            type: actualMime
          }
        );

        setUploading(true);
        setErr('');

        try {
          const [transcript, url] =
            await Promise.all([
              transcribeVoice(blob),
              uploadFile(
                file,
                `voice/${user.id}`
              )
            ]);

          setFiles((previous) => [
            ...previous,
            {
              url,
              name: `Voice note (${duration}s)`,
              kind: 'audio'
            }
          ]);

          if (transcript.length < 3) {
            throw new Error(
              messages.voiceUnclear
            );
          }
        } catch (error) {
          setErr(
            error instanceof Error
              ? error.message
              : messages.voiceProcessFailed
          );
        } finally {
          setUploading(false);
          setRecSecs(0);
        }
      };

      mediaRef.current = recorder;

      recorder.start(250);

      setRecording(true);
      setRecSecs(0);

      timerRef.current = window.setInterval(() => {
        setRecSecs((seconds) => {
          const next = seconds + 1;

          if (next >= 120) {
            if (
              mediaRef.current?.state === 'recording'
            ) {
              mediaRef.current.stop();
            }

            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }

            setRecording(false);
          }

          return next;
        });
      }, 1000);
    } catch (error) {
      setRecording(false);

      setErr(
        error instanceof Error &&
          error.name === 'NotAllowedError'
          ? messages.micPermission
          : messages.micAccess
      );
    }
  };

  const removeFile = (index: number) => {
    setFiles((previous) => {
      const target = previous[index];

      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }

      return previous.filter(
        (_, currentIndex) =>
          currentIndex !== index
      );
    });
  };

  const next = async () => {
    setErr('');

    const symptomText = text.trim();

    if (symptomText.length < 10) {
      setErr(
        files.length > 0
          ? messages.attachmentNeedsText
          : tr(
              'Kam se kam 10 aksharon me apni takleef likhein.'
            )
      );

      return;
    }

    if (uploading) {
      setErr(
        tr('Upload complete hone ka wait karein.')
      );
      return;
    }

    if (recording) {
      setErr(
        tr('Pehle voice recording stop karein.')
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        '/api/ai-triage',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: symptomText,
            language: lang,
            attachments: files.map((file) => ({
              name: file.name,
              kind: file.kind,
              url: file.url || ''
            }))
          })
        }
      );

      let data: TriageResponse;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          tr(
            'Smart Triage se valid response nahi mila.'
          )
        );
      }

      if (!response.ok) {
        throw new Error(
          tr(
            'Smart Triage abhi available nahi hai.'
          )
        );
      }

      if (
        !data.success ||
        !data.result ||
        !data.result.urgency
      ) {
        throw new Error(
          tr(
            'Smart Triage ka response incomplete hai.'
          )
        );
      }

      const storedFiles = files.map(
        ({ url, name, kind }) => ({
          url,
          name,
          kind
        })
      );

      sessionStorage.setItem(
        'medguide_triage_result',
        JSON.stringify({
          text: symptomText,
          lang,
          attachments: storedFiles,
          provider: data.provider,
          model: data.model,
          result: data.result
        })
      );

      sessionStorage.setItem(
        'medguide_intake',
        JSON.stringify({
          text: symptomText,
          lang,
          attachments: storedFiles
        })
      );

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });

      nav('/triage');
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : tr(
              'Smart Triage fail ho gaya. Dobara try karein.'
            )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <MedGuideResumeResult storageKey="medguide_triage_result" resultPath="/triage" />
      <PageHero
        icon={<MessageSquareText size={28} />}
        kicker={tr('Step 1 · AI Smart Intake')}
        title={tr('Apni takleef batayein')}
        sub={tr(
          'Apni problem apne shabdon me likhein. Smart Triage aapke symptoms aur context ko samajhkar possible causes, urgency aur next steps batayega.'
        )}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Reveal>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
            <label className="mb-1.5 block text-[13px] font-bold text-slate-600">
              {LABEL[lang]}
            </label>

            <textarea
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              rows={5}
              maxLength={6000}
              placeholder={HINTS[lang]}
              className="w-full rounded-2xl border-2 border-slate-200 p-4 text-[15px] leading-relaxed outline-none transition focus:border-[#1D6FF2]"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {text.trim().length} {tr('akshar')} (
              {tr('min 10')})
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  imgRef.current?.click()
                }
                disabled={uploading || saving}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600 hover:border-[#1D6FF2] hover:text-[#0B3D91] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ImagePlus size={18} />
                {tr('Photo / Report')}
              </button>

              <button
                type="button"
                onClick={() =>
                  docRef.current?.click()
                }
                disabled={uploading || saving}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600 hover:border-[#1D6FF2] hover:text-[#0B3D91] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Paperclip size={18} />
                {tr('Document')}
              </button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={toggleRec}
                disabled={uploading || saving}
                className={
                  'flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ' +
                  (recording
                    ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                    : 'border-2 border-dashed border-slate-300 text-slate-600 hover:border-red-400 hover:text-red-600')
                }
              >
                {recording ? (
                  <>
                    <MicOff size={18} />
                    {tr('Stop')} ({recSecs}s)
                  </>
                ) : (
                  <>
                    <Mic size={18} />
                    {tr('Voice Note')}
                  </>
                )}
              </motion.button>

              <input
                ref={imgRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(event) => {
                  void addFiles(
                    event.target.files,
                    'image'
                  );

                  event.target.value = '';
                }}
              />

              <input
                ref={docRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                multiple
                hidden
                onChange={(event) => {
                  void addFiles(
                    event.target.files,
                    'doc'
                  );

                  event.target.value = '';
                }}
              />
            </div>

            {recording && (
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl bg-red-50 py-2.5">
                {Array.from({
                  length: 16
                }).map((_, index) => (
                  <motion.span
                    key={index}
                    className="w-1 rounded-full bg-red-500"
                    animate={{
                      height: [6, 22, 6]
                    }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      delay: index * 0.06
                    }}
                  />
                ))}
              </div>
            )}

            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  className="mt-4 grid gap-2 sm:grid-cols-2"
                >
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-2.5 ring-1 ring-slate-200"
                    >
                      {file.kind === 'image' &&
                      file.preview ? (
                        <img
                          src={file.preview}
                          alt=""
                          className="h-11 w-11 rounded-xl object-cover"
                        />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#0B3D91]">
                          {file.kind === 'audio' ? (
                            <Volume2 size={20} />
                          ) : (
                            <Paperclip size={20} />
                          )}
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-slate-700">
                          {file.name}
                        </p>

                        <p className="text-[11px] font-semibold text-emerald-600">
                          {tr(
                            '✓ Secure upload complete'
                          )}
                        </p>

                        {file.url &&
                          file.kind === 'audio' && (
                            <audio
                              src={file.url}
                              controls
                              className="mt-1 h-7 w-full"
                            />
                          )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFile(index)
                        }
                        disabled={saving}
                        aria-label={tr('Remove')}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {files.length > 0 && (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-[12px] font-semibold leading-relaxed text-amber-700">
                {tr(
                  'Photo, document aur voice note securely upload honge. Current Smart Triage abhi written description ko analyse karta hai; uploaded file ki medical content ko analyse karne ka claim nahi karega.'
                )}
              </p>
            )}

            {uploading && (
              <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-[#1D6FF2]">
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                {tr(
                  'Voice/File process ho raha hai...'
                )}
              </p>
            )}

            {err && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-center text-[13px] font-semibold text-red-600">
                {err}
              </p>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => void next()}
              disabled={
                saving ||
                uploading ||
                recording
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] py-4 font-bold text-white shadow-xl shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  {tr(
                    'AI symptoms analyse kar raha hai...'
                  )}
                </>
              ) : (
                <>
                  {tr(
                    'Aage Badhein — Smart Triage'
                  )}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-[#0B1F3A] to-[#0B3D91] p-5 text-white shadow-xl">
              <p className="text-sm font-bold">
                {tr(
                  '💡 Achhe se batane ke tips'
                )}
              </p>

              <ul className="mt-2 space-y-1.5 text-[13px] text-blue-100">
                <li>
                  {tr(
                    '• Kab se hai? (2 din / 1 hafta...)'
                  )}
                </li>

                <li>
                  {tr(
                    '• Dard kitna? (halka / tez / bahut tez)'
                  )}
                </li>

                <li>
                  {tr(
                    '• Kya khaane/peene se badhta-ghatta hai?'
                  )}
                </li>

                <li>
                  {tr(
                    '• Koi dawa li? Kaun si?'
                  )}
                </li>

                <li>
                  {tr(
                    '• Koi existing disease ya treatment chal raha hai to batayein'
                  )}
                </li>
              </ul>
            </div>

            <Disclaimer compact />
          </div>
        </Reveal>
      </div>
    </div>
  );
}