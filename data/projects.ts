export type Project = {
  name: string;
  date: string; // YYYY-MM, used for sorting (newest first)
  dateLabel: string;
  category: string;
  ee?: boolean;
  archived?: boolean;
  summary: string;
  skills: string[];
  youtubeId?: string;
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    name: "Beacon",
    date: "2026-05",
    dateLabel: "Hackachusetts, 2026",
    category: "Public Safety",
    ee: true,
    summary:
      "Firefighter search-priority system that uses Wi-Fi channel state information and a 1-D CNN to detect signs of movement. ESP32 firmware for transmitters, CSI receivers and responder tags, a FastAPI hub, and a live responder dashboard with floor plans.",
    skills: ["ESP32", "C", "Wi-Fi CSI", "TensorFlow Lite", "Python", "FastAPI", "WebSockets", "TypeScript"],
    youtubeId: "2WN5VsAbgl0",
    links: [
      { label: "GitHub", href: "https://github.com/eberhart441/hackathon10.24.26" },
      { label: "Project page", href: "https://www.sundai.club/projects/4c84b8ee-c3f9-4e6b-86af-993acf7b7954" },
    ],
  },
  {
    name: "Autonomous Robotic Vehicle",
    date: "2026-04",
    dateLabel: "Junior Design Project, 2026",
    category: "Robotics",
    ee: true,
    summary:
      "ESP32-S3 vehicle with L293D H-bridge dual motor drive, PWM tuning, IR obstacle sensing with ADC conditioning, magnetic encoders and odometry. Chassis designed in Onshape, PCB in KiCad, debugged with an oscilloscope.",
    skills: ["ESP32-S3", "C++", "PlatformIO", "PWM", "ADC", "Encoders", "KiCad", "Onshape", "Oscilloscope"],
        links: [
          {
            label: "Onshape document",
            href: "https://cad.onshape.com/documents/fc1cf228bec1f749403a388c/w/57d30d8adeac1e7dd3639504/e/ed718b141f56af9c638f0d83",
          },
        ],
  },
  {
    name: "Project Oath",
    date: "2026-04",
    dateLabel: "Apr 2026 - Present",
    category: "Healthcare",
    summary:
      "Credit-based mentorship exchange for students in the medical pipeline, spanning 91 high schools, 57 colleges and 22 medical schools with 150+ mentorship sessions. Sole developer and founding technical lead.",
    skills: ["React", "TailwindCSS", "PostgreSQL", "Supabase"],
    links: [{ label: "projectoath.com", href: "https://projectoath.com/" }],
  },
  {
    name: "Onshape MCP Server",
    date: "2025-11",
    dateLabel: "2025",
    category: "Engineering Tools",
    summary:
      "An MCP server that lets AI agents drive Onshape CAD. Built before the official Onshape MCP; appreciated by Jon Hirschtick, founder of SolidWorks and Onshape.",
    skills: ["MCP", "AI", "CAD", "Onshape API"],
    youtubeId: "bsL_8EN9Ih0",
    links: [{ label: "GitHub", href: "https://github.com/nisheshnath-spec/OnshapeMCP" }],
  },
  {
    name: "Porta-Pot",
    date: "2026-02",
    dateLabel: "EE14, Tufts, 2026",
    category: "Embedded Systems",
    ee: true,
    summary:
      "Remote-controlled planter for the EE14 embedded systems course. I designed the block diagram and wrote the NRF24L01 SPI radio code; joystick via ADC drives DC motors through a DRV8833.",
    skills: ["SPI", "NRF24L01", "DRV8833", "ADC", "DC Motors", "C"],
    links: [{ label: "GitHub", href: "https://github.com/natphua/porta-pot" }],
  },
  {
    name: "Fitwise",
    date: "2025-10",
    dateLabel: "HackHarvard 2025",
    category: "Health & Fitness",
    summary:
      "Real-time AI fitness coach built in two days with three friends: pose tracking, rep counting and voice feedback.",
    skills: ["MediaPipe", "Computer Vision", "Flask-SocketIO", "Next.js", "Gemini API", "ElevenLabs"],
    youtubeId: "rpG1Po_12Vk",
    links: [{ label: "Devpost", href: "https://devpost.com/software/fitwise" }],
  },
  {
    name: "FlowTab",
    date: "2025-03",
    dateLabel: "2025",
    archived: true,
    category: "Productivity",
    summary: "A calmer new-tab page for the browser.",
    skills: ["JavaScript", "Chrome Extension"],
    links: [
      {
        label: "Chrome Web Store",
        href: "https://chromewebstore.google.com/detail/flowtab/ainabceojclhldicflamfgghhkmmcnlo",
      },
    ],
  },
  {
    name: "CarbonQuest",
    date: "2023-04",
    dateLabel: "2023",
    archived: true,
    category: "Sustainability",
    summary: "A small app for keeping track of carbon emissions.",
    skills: ["App Development"],
    links: [{ label: "Congressional App Challenge", href: "https://www.congressionalappchallenge.us/23-ma06/" }],
  },
];
