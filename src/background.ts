function setDailyAlarms() {
  const morningAlarmTime = new Date();
  morningAlarmTime.setHours(9, 30, 0);
  const eveningAlarmTime = new Date();
  eveningAlarmTime.setHours(18, 30, 0);

  const now = new Date();
  if (now > morningAlarmTime) {
    morningAlarmTime.setDate(morningAlarmTime.getDate() + 1);
  }
  if (now > eveningAlarmTime) {
    eveningAlarmTime.setDate(eveningAlarmTime.getDate() + 1);
  }

  chrome.alarms.create("morningAlarm", {
    when: morningAlarmTime.getTime(),
  });
  chrome.alarms.create("eveningAlarm", {
    when: eveningAlarmTime.getTime(),
  });
}

function showMorningNotification() {
  chrome.storage.sync.get(["isOnAlarm"], (result) => {
    if (result.isOnAlarm) {
      chrome.notifications.create("morningAlarm", {
        type: "basic",
        iconUrl: "icon128.png",
        title: "출근 찍으셨나요?",
        message: "오늘도 화이팅하세요! \n베너를 클릭하여 출근하세요!",
      });
    }
  });
}

function showEveningNotification() {
  chrome.storage.sync.get(["isOnAlarm"], (result) => {
    if (result.isOnAlarm) {
      chrome.notifications.create("eveningAlarm", {
        type: "basic",
        iconUrl: "icon128.png",
        title: "퇴근 찍으셨나요?",
        message: "오늘 하루 고생하셨어요! \n베너를 클릭하여 퇴근하세요!",
      });
    }
  });
}

chrome.notifications.onClicked.addListener((notifId) => {
  if (notifId === "morningAlarm" || notifId === "eveningAlarm") {
    chrome.tabs.create({ url: "https://hr.workup.plus" });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "morningAlarm") {
    showMorningNotification();
  }

  if (alarm.name === "eveningAlarm") {
    showEveningNotification();
  }
});

chrome.runtime.onInstalled.addListener(() => {
  setDailyAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  setDailyAlarms();
});

async function sendDataToServer(data: any) {
  await fetch("http://43.200.104.77:5000/url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "pageLoad") {
    sendDataToServer(message.data);
  }
});
