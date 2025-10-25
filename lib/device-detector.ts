// lib/device-detector.ts
import { headers } from "next/headers"
import { UAParser } from "ua-parser-js"

export async function getDeviceInfo() {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"

  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  return {
    userAgent,
    ip,
    browserName: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "",
    osName: result.os.name || "Unknown",
    osVersion: result.os.version || "",
    deviceType: result.device.type || "desktop",
    deviceVendor: result.device.vendor || "",
    deviceModel: result.device.model || "",
  }
}

export function generateDeviceId(userAgent: string, ip: string): string {
  // Criar um ID único baseado em user agent + IP
  const crypto = require("crypto")
  return crypto.createHash("sha256").update(`${userAgent}-${ip}`).digest("hex").substring(0, 32)
}

export function getPlatformFromUA(ua: string): string {
  const parser = new UAParser(ua)
  const result = parser.getResult()

  if (result.device.type === "mobile") {
    if (result.os.name?.toLowerCase().includes("ios")) return "MOBILE_IOS"
    return "MOBILE_ANDROID"
  }

  if (result.os.name?.toLowerCase().includes("mac")) return "DESKTOP_MAC"
  if (result.os.name?.toLowerCase().includes("windows")) return "DESKTOP_WINDOWS"
  if (result.os.name?.toLowerCase().includes("linux")) return "DESKTOP_LINUX"

  return "WEB"
}
