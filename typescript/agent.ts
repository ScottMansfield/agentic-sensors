/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { createConnection } from "net";
import { encode, decode } from "@msgpack/msgpack";
import { once } from "events";
import { FunctionTool, LlmAgent } from "@google/adk";
import { z } from "zod";
import { Logger } from "tslog";

// --- Types & Interfaces ---

// 1. Define the specific data we expect back from the hardware
interface SensorData {
  temperature: number; // Float
  humidity: number; // Float
  lux: number; // Int
}

// 2. Define standard MsgPack RPC Tuple types
// Request: [type=0, msgid, method, params]
type RpcRequestTuple = [0, number, string, unknown[]];

// Response: [type=1, msgid, error, result]
type RpcResponseTuple = [1, number, unknown | null, SensorData];

// --- Logger ---

const logger = new Logger({minLevel: 3});

// --- Helper Function ---

const SOCKET_PATH = "/var/run/arduino-router.sock";

/**
 * Connects to the Unix socket, sends a request, and returns the result.
 */
async function sensorRpcRequest(): Promise<SensorData> {
  const client = createConnection(SOCKET_PATH);
  const msgId = 1; // Static ID for simplicity, can be dynamic

  // Construct the RPC request
  const request: RpcRequestTuple = [0, msgId, "read_sensors", []];
  const packedReq = encode(request);
  logger.debug(packedReq);

  try {
    logger.debug("Connecting...");
    await once(client, "connect");

    logger.debug("Connected. Writing...");
    client.write(packedReq);

    logger.debug("Waiting for response...");
    const [data] = await once(client, "data");

    logger.debug(data);

    // Decode and cast to our expected tuple type
    const response = decode(data as Uint8Array) as RpcResponseTuple;

    logger.debug(response);

    // Destructure to get the relevant parts: [type, msgid, error, result]
    const [, , error, result] = response;

    logger.debug(result);

    if (error) {
      const errString = `RPC Error: ${JSON.stringify(error)}`;
      logger.error(errString);
      throw new Error(errString);
    }

    return {
      temperature: result[0],
      humidity: result[1],
      lux: result[2],
    };
  } finally {
    // Ensure socket is closed even if errors occur
    client.end();
  }
}

const read_sensors = new FunctionTool({
  name: "read_sensors",
  description: "Gets the current readings from environmental sensors",
  parameters: z.object(),
  execute: async () => {
    const sensorData = await sensorRpcRequest();
    return sensorData;
  },
});

export const rootAgent = new LlmAgent({
  name: "sensor_reader",
  model: "gemini-2.5-flash",
  description: "Agent to answer questions about my environment",
  instruction:
    "You are an agent that is dedicated to reading environment sensors and returning them to the user. You are able to read temperature, humidity, and light level (lux) only. You must use the read_sensors tool to read this data. When reading the data, return the information in a tidy table. After the table, include a random fact about the humidity, temperature, or light values returned, for example the amazon rainforest or a desert has the same average humidity in June as the humidity level returned from the tool.",
  tools: [read_sensors],
});

/*
 * Main function if used as standalone debugging
// --- Main Execution ---

async function main() {
  logger.info("Reading sensor data...");

  try {
    // Call the separated function
    const sensorData = await sendRpcRequest("read_sensors");
    logger.debug(sensorData);

    // Access typed properties directly
    logger.info("-----------------------");
    logger.info("Success! Sensor Readings:");
    logger.info(`Temp:     ${sensorData.temperature.toFixed(2)} °C`);
    logger.info(`Humidity: ${sensorData.humidity.toFixed(2)} %`);
    logger.info(`Light:    ${sensorData.lux} lux`);
    logger.info("-----------------------");
  } catch (error) {
    logger.error("Communication failed:", error);
    exit(1);
  }
}

main();
*/
