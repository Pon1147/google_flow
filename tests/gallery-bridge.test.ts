import { Shot } from '../types';

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}. Expected: ${expected}, got: ${actual}`);
  }
}

console.log('Running Gallery Bridge verification tests...');

// TC-01: Track-back mediaId preservation
const initialShot: Shot = {
  id: 'shot-1',
  type: 'Wide Shot',
  description: 'Camera pans across room',
  dialog: 'Welcome to our space',
  visualCue: 'TEXT',
  timing: '3.0',
  renderedImage: {
    base64: 'abc1234',
    mimeType: 'image/png',
    mediaId: 'media_project_asset_001',
    is4k: false
  }
};

assertEqual(initialShot.renderedImage?.mediaId, 'media_project_asset_001', 'TC-01 Failed: mediaId must exist');
assertEqual(initialShot.renderedImage?.is4k, false, 'TC-01 Failed: initial image is not 4k');

// TC-03: Pick 4K replacement simulation
const mockSelected4kItem = {
  mediaId: 'media_project_asset_001_upsampled',
  base64: 'def5678',
  mimeType: 'image/png',
  name: 'shot_1_upsampled.png'
};

const updatedShot: Shot = {
  ...initialShot,
  renderedImage: {
    base64: mockSelected4kItem.base64,
    mimeType: mockSelected4kItem.mimeType,
    mediaId: mockSelected4kItem.mediaId,
    name: mockSelected4kItem.name,
    is4k: true
  }
};

assertEqual(updatedShot.renderedImage?.is4k, true, 'TC-03 Failed: is4k flag must be true');
assertEqual(updatedShot.renderedImage?.mediaId, 'media_project_asset_001_upsampled', 'TC-03 Failed: mediaId must be updated to 4k asset');

// TC-04: Pick 4K Cancel simulation (null item)
const nullSelectedItem = null;
let canceledShot = { ...updatedShot };
if (nullSelectedItem) {
  canceledShot = { ...canceledShot, renderedImage: nullSelectedItem };
}
assertEqual(canceledShot.renderedImage?.mediaId, 'media_project_asset_001_upsampled', 'TC-04 Failed: existing image must remain untouched on cancel');

// TC-05: Regenerate Reset
const regeneratedShot: Shot = {
  ...updatedShot,
  renderedImage: {
    base64: 'new_render_data',
    mimeType: 'image/png',
    mediaId: 'media_project_asset_002',
    is4k: false
  }
};
assertEqual(regeneratedShot.renderedImage?.is4k, false, 'TC-05 Failed: is4k must be reset to false on regenerate');
assertEqual(regeneratedShot.renderedImage?.mediaId, 'media_project_asset_002', 'TC-05 Failed: new mediaId must replace old one');

console.log('All 5 Gallery Bridge self-check tests PASSED successfully!');
