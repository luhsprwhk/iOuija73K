function getBrowserDetails() {
    const now = new Date();
    const hour = now.getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    
    // Get browser info
    const ua = navigator.userAgent;
    let browser = "browser";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";
    
    // Get OS
    let os = "computer";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "Mac";
    else if (ua.includes("Linux")) os = "Linux";
    
    return { timeOfDay, browser, os, hour };
  }

  export default getBrowserDetails;