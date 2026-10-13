import fs from 'fs/promises';
import path from 'path';
import { CustomWorld } from './world';

export async function captureFailure(world: CustomWorld, scenarioName: string): Promise<void> {
  const directory = path.resolve(process.cwd(), 'screenshots', 'failed-tests');
  await fs.mkdir(directory, { recursive: true });
  const fileName = `${Date.now()}-${scenarioName.replace(/[^a-z0-9-_]+/gi, '_')}.json`;
  const responseText = world.response ? await world.response.text() : '';
  const filePath = path.join(directory, fileName);
  await fs.writeFile(filePath, JSON.stringify({ scenario: scenarioName, status: world.response?.status(), response: responseText.slice(0, 5000) }, null, 2));
  world.screenshotPath = filePath;
}
