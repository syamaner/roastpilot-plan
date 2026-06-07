import { useState } from "react";
import { RoastHeader } from "./RoastHeader";
import { TemperatureChart } from "./TemperatureChart";
import { ControlIndicator } from "./ControlIndicator";
import { AdvisoryPanel } from "./AdvisoryPanel";
import { ActionBar } from "./ActionBar";
import { NotificationCenter } from "./NotificationCenter";
import { OperatorRecoveryModal } from "./OperatorRecoveryModal";
import { FaultBanner } from "./FaultBanner";

interface Layout3EnhancedProps {
  mockData: any;
  showRecoveryModal?: boolean;
  showFaultBanner?: boolean;
}

interface Notification {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "warning" | "success";
  read: boolean;
}

export function Layout3Enhanced({ mockData, showRecoveryModal = false, showFaultBanner = false }: Layout3EnhancedProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      timestamp: "02:45",
      message: "Charge zone reached — you can add beans.",
      type: "success",
      read: false,
    },
    {
      id: "2",
      timestamp: "02:30",
      message: "Temperature climbing steadily, ETA to charge zone: 30s",
      type: "info",
      read: false,
    },
    {
      id: "3",
      timestamp: "02:15",
      message: "LLM recommendation REJECTED: RoR increase would violate safety bounds",
      type: "warning",
      read: true,
    },
    {
      id: "4",
      timestamp: "02:00",
      message: "Preheat phase started",
      type: "info",
      read: true,
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const recoveryState = {
    lastKnownPhase: "DEVELOPMENT",
    lastKnownTime: "10:02",
    lastBeanTemp: 204,
    lastHeat: 60,
    lastFan: 55,
    currentBeanTemp: 198,
    currentEnvTemp: 215,
    restartedAt: "10:02:47",
  };

  const faultEvents = [
    {
      timestamp: "01:58:23",
      action: "THERMAL OVERRUN DETECTED",
      detail: "Bean temp 201°C exceeded pre-charge limit of 200°C",
    },
    {
      timestamp: "01:58:23",
      action: "HEAT FORCED TO 0%",
      detail: "Safety layer overrode heat control, set to minimum",
    },
    {
      timestamp: "01:58:24",
      action: "FAN SET TO 100%",
      detail: "Maximum cooling applied to prevent further temperature rise",
    },
    {
      timestamp: "01:58:24",
      action: "CONTROL LOOP LOCKED",
      detail: "LLM advisor disabled, manual intervention required",
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-background dark">
      {showFaultBanner && (
        <FaultBanner
          faultType="Pre-T0 Thermal Overrun"
          description="Bean temperature exceeded 200°C before beans were added to the roaster"
          events={faultEvents}
          currentBeanTemp={201}
          currentHeat={0}
          currentFan={100}
          onAcknowledge={() => console.log("Fault acknowledged")}
        />
      )}

      <RoastHeader
        phase={mockData.phase}
        roastTime={mockData.roastTime}
        developmentTime={mockData.developmentTime}
        developmentPercent={mockData.developmentPercent}
        profileName={mockData.profileName}
        connectionStatus={mockData.connectionStatus}
      />

      <div className={`flex-1 flex flex-col gap-4 p-4 overflow-hidden ${showRecoveryModal ? 'opacity-50' : ''}`}>
        <div className="flex-1 min-h-0">
          <TemperatureChart
            data={mockData.chartData}
            phase={mockData.phase}
            showChargeZone={mockData.phase === "Preheating"}
          />
        </div>

        <div className="flex gap-4">
          <ControlIndicator
            type="heat"
            current={showFaultBanner ? 0 : mockData.heat.current}
            target={mockData.heat.target}
            advisorTarget={mockData.heat.advisorTarget}
          />
          <ControlIndicator
            type="fan"
            current={showFaultBanner ? 100 : mockData.fan.current}
            target={mockData.fan.target}
            advisorTarget={mockData.fan.advisorTarget}
          />
        </div>

        <div>
          <AdvisoryPanel
            latestDecision={mockData.latestDecision}
            history={mockData.decisionHistory}
          />
        </div>
      </div>

      <ActionBar
        onEmergencyStop={() => console.log("Emergency stop")}
        onDropBeans={() => console.log("Drop beans")}
        onMarkFirstCrack={() => console.log("First crack")}
        onPauseAdvisor={() => console.log("Pause advisor")}
        onStopCooling={() => console.log("Stop cooling")}
        coolingEnabled={false}
      />

      <NotificationCenter
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onClearAll={handleClearAll}
      />

      {showRecoveryModal && (
        <OperatorRecoveryModal
          state={recoveryState}
          onResumeMonitoring={() => console.log("Resume monitoring")}
          onDropBeans={() => console.log("Drop beans")}
          onStartCooling={() => console.log("Start cooling")}
          onEmergencyStop={() => console.log("Emergency stop")}
        />
      )}
    </div>
  );
}
