import React, { useState, useEffect } from "react";
import "./App.css";

// PET STATUS CONSTANTS
const MAX_HEALTH = 100;
const HEALTH_DECREMENT_INTERVAL = 60000; // 1 minute for demo, adjust for game balance
const FEED_HEALTH_BOOST = 20;
const REST_HEALTH_BOOST = 15;

// PET STATES
const initialPetState = {
  health: MAX_HEALTH,
  hunger: 0, // 0: full, 100: starving
  energy: 100,
  isSleeping: false,
  notifications: [],
  animation: "idle", // idle | eating | sleeping
};

// Utility for random playful pet phrases
const randomPetPhrase = () => {
  const phrases = [
    "I'm feeling great! 🎉",
    "Yum! That was tasty! 🍪",
    "So sleepy... 😴",
    "Let's play!",
    "Feed me please!",
    "I need some rest...",
    "What a lovely day!",
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
};

// PUBLIC_INTERFACE
function App() {
  // PET STATE
  const [pet, setPet] = useState(initialPetState);
  const [theme, setTheme] = useState("light");
  const [message, setMessage] = useState(randomPetPhrase());
  const [actionCooldown, setActionCooldown] = useState(false);

  // THEME EFFECT
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // HEALTH/STATUS DECREMENT OVER TIME EFFECT
  useEffect(() => {
    if (pet.isSleeping) return;
    const timer = setInterval(() => {
      setPet(prev => {
        let newHealth = prev.health - 5;
        let newHunger = Math.min(prev.hunger + 8, 100);
        let newEnergy = Math.max(prev.energy - 10, 0);
        let notifications = [...prev.notifications];
        if (newHealth <= 30 && !notifications.includes("warning-low-health")) {
          notifications.push("warning-low-health");
        }
        if (newHunger >= 70 && !notifications.includes("warning-hungry")) {
          notifications.push("warning-hungry");
        }
        if (newEnergy <= 30 && !notifications.includes("warning-tired")) {
          notifications.push("warning-tired");
        }
        return {
          ...prev,
          health: Math.max(newHealth, 0),
          hunger: newHunger,
          energy: newEnergy,
          notifications,
        };
      });
    }, HEALTH_DECREMENT_INTERVAL);

    return () => clearInterval(timer);
  }, [pet.isSleeping]);

  // PET ALERTS
  useEffect(() => {
    if (pet.health <= 0) {
      setMessage("Oh no! Your pet is very sick. Take care of it!");
    } else if (pet.hunger >= 80) {
      setMessage("I'm so hungry! Feed me! 🍬");
    } else if (pet.energy <= 20) {
      setMessage("I'm exhausted, can I rest? 💤");
    } else {
      setMessage(randomPetPhrase());
    }
  }, [pet.health, pet.hunger, pet.energy]);

  // FEED PET
  // PUBLIC_INTERFACE
  const handleFeed = () => {
    if (pet.isSleeping || actionCooldown) return;
    setActionCooldown(true);
    setPet(prev => ({
      ...prev,
      animation: "eating",
      health: Math.min(prev.health + FEED_HEALTH_BOOST, MAX_HEALTH),
      hunger: Math.max(prev.hunger - 40, 0),
      notifications: prev.notifications.filter(n => n !== "warning-hungry"),
    }));
    setMessage("Yum, thank you! 🍎");
    setTimeout(() => {
      setPet(prev => ({ ...prev, animation: "idle" }));
      setActionCooldown(false);
    }, 1300);
  };

  // REST PET
  // PUBLIC_INTERFACE
  const handleRest = () => {
    if (pet.isSleeping || actionCooldown) return;
    setActionCooldown(true);
    setPet(prev => ({
      ...prev,
      animation: "sleeping",
      isSleeping: true,
      notifications: prev.notifications.filter(n => n !== "warning-tired"),
    }));
    setMessage("Zzz... Sweet dreams! 🌙");
    setTimeout(() => {
      setPet(prev => ({
        ...prev,
        isSleeping: false,
        energy: 100,
        health: Math.min(prev.health + REST_HEALTH_BOOST, MAX_HEALTH),
        animation: "idle",
      }));
      setActionCooldown(false);
    }, 2000);
  };

  // Toggle theme
  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Helper for notification rendering
  const activeNotifications = () => {
    let notes = [];
    if (pet.health <= 30)
      notes.push({ text: "⚠️ Your pet's health is low!", color: "#ff9800" });
    if (pet.hunger >= 70)
      notes.push({ text: "🍬 Your pet is very hungry!", color: "#ff9800" });
    if (pet.energy <= 30)
      notes.push({ text: "💤 Your pet is tired!", color: "#ff9800" });
    if (pet.isSleeping)
      notes.push({ text: "😴 Your pet is sleeping...", color: "#4caf50" });
    return notes;
  };

  // PET COMPONENT
  const VirtualPet = () => {
    // Animation based on pet state
    if (pet.animation === "eating") {
      return (
        <div className="pet-animation eating" role="img" aria-label="Pet eating">
          <div className="pet-face">😋</div>
          <div className="pet-food">🍎</div>
        </div>
      );
    }
    if (pet.animation === "sleeping" || pet.isSleeping) {
      return (
        <div className="pet-animation sleeping" role="img" aria-label="Pet sleeping">
          <div className="pet-face">😴</div>
          <div className="pet-zzz">💤</div>
        </div>
      );
    }
    // Idle playful animation
    return (
      <div className="pet-animation idle" role="img" aria-label="Pet idle">
        <div className="pet-face">🐾</div>
        <div className="pet-bounce" />
      </div>
    );
  };

  // HEALTH BAR COMPONENT
  const HealthBar = ({ value }) => (
    <div className="bar-outer">
      <div
        className="bar-inner"
        style={{
          width: `${value}%`,
          background: value > 50 ? "#4caf50" : value > 30 ? "#ff9800" : "#f44336",
        }}
      />
      <span className="bar-label">Health</span>
    </div>
  );

  // ENERGY BAR COMPONENT
  const EnergyBar = ({ value }) => (
    <div className="bar-outer energy">
      <div
        className="bar-inner"
        style={{
          width: `${value}%`,
          background: value > 50 ? "#2196f3" : value > 30 ? "#ff9800" : "#f44336",
        }}
      />
      <span className="bar-label">Energy</span>
    </div>
  );

  // HUNGER BAR (inverse)
  const HungerBar = ({ value }) => (
    <div className="bar-outer hunger">
      <div
        className="bar-inner"
        style={{
          width: `${value}%`,
          background:
            value < 30 ? "#4caf50" : value < 70 ? "#ff9800" : "#f44336",
        }}
      />
      <span className="bar-label">Hunger</span>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header pet-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <div className="pet-status-bar">
          <HealthBar value={pet.health} />
          <EnergyBar value={pet.energy} />
          <HungerBar value={pet.hunger} />
        </div>

        <div className="pet-area">
          <VirtualPet />
          <div className="pet-message">{message}</div>

          <div className="pet-actions">
            <button
              className="pet-btn"
              onClick={handleFeed}
              disabled={pet.isSleeping || actionCooldown}
              aria-label="Feed pet"
            >
              🍎 Feed
            </button>
            <button
              className="pet-btn"
              onClick={handleRest}
              disabled={pet.isSleeping || actionCooldown}
              aria-label="Let pet rest"
            >
              💤 Rest
            </button>
          </div>
        </div>
        <div className="notifications-wrap">
          {activeNotifications().map((n, i) => (
            <div
              className="pet-notification"
              key={i}
              style={{ background: n.color }}
            >
              {n.text}
            </div>
          ))}
        </div>
        <footer className="pet-footer">
          <small>
            Virtual Pet Game &copy; 2024 | Web demo. Inspired by MyBoo.
          </small>
        </footer>
      </header>
    </div>
  );
}

export default App;
