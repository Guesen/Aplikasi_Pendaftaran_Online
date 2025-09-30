"use client";

type QueueData = {
  loketA: number;
  loketB: number;
  lastReset: string;
};

const KEY = "mrebetQueue";

const getInitialQueueData = (): QueueData => {
  if (typeof window === "undefined") {
    // Return a default structure for server-side rendering
    return { loketA: 0, loketB: 0, lastReset: new Date().toISOString().split("T")[0] };
  }
  
  const today = new Date().toISOString().split("T")[0];

  try {
    const storedData = localStorage.getItem(KEY);
    if (storedData) {
      const parsed = JSON.parse(storedData) as QueueData;
      // Reset if the date is not today
      if (parsed.lastReset === today) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read from localStorage", e);
  }
  
  // Return fresh data if nothing is stored or it's a new day.
  // Start with 0 so the first number given is 1.
  return { loketA: 0, loketB: 0, lastReset: today };
};


export const getNextQueueNumber = (type: "A" | "B"): number => {
  if (typeof window === "undefined") {
    console.warn("getNextQueueNumber called on the server.");
    return 1;
  }

  const data = getInitialQueueData();
  
  const nextNumber = type === "A" ? ++data.loketA : ++data.loketB;
  
  if (type === "A") {
    data.loketA = nextNumber;
  } else {
    data.loketB = nextNumber;
  }

  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }

  return nextNumber;
};

export const resetQueue = () => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    // Set to initial state instead of removing, to avoid race conditions.
    const today = new Date().toISOString().split("T")[0];
    const initialData = { loketA: 0, loketB: 0, lastReset: today };
    localStorage.setItem(KEY, JSON.stringify(initialData));
    
    // Optional: Give user feedback that queue has been reset
    alert("Nomor antrian telah direset.");
    window.location.reload(); // Reload to clear any component state
  } catch (e) {
    console.error("Failed to reset queue in localStorage", e);
    alert("Gagal mereset nomor antrian.");
  }
};
