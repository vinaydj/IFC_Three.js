import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import { database } from './database';
import { wiv } from './wiv';

document.addEventListener("DOMContentLoaded", async () => {

  /* ------------------------
     Database
  ------------------------- */
  const db = database.createOrOpenDatabase();

  /* ------------------------
     DOM elements
  ------------------------- */
  const container = document.getElementById('viewer-container');
  const propertiesContainer = document.getElementById('properties-container');
  const guideContainer = document.getElementById('guide-container');
  const paletteContainer = document.getElementById('palette-container');

  const sampleButton = document.getElementById('sample-button');
  const saveButton = document.getElementById('save-button');
  const removeButton = document.getElementById('remove-button');
  const dimButton = document.getElementById('dim-button');
  const paletteButton = document.getElementById('palette-button');
  const guideButton = document.getElementById('guide-button');
  const input = document.getElementById('file-input');

  /* ------------------------
     Viewer setup
  ------------------------- */
  const viewer = new IfcViewerAPI({
    container,
    backgroundColor: new Color(0xffffff)
  });

  const savedBg = localStorage.getItem('bgColor');
  if (savedBg) {
    viewer.context.getScene().background = new Color(savedBg);
  }

  wiv.viewerSetup(viewer);

  /* ------------------------
     Color picker
  ------------------------- */
  let bgColor;
  const cj = colorjoe.rgb(document.querySelector('.colorjoe'));
  cj.show();

  cj.on("change", color => {
    bgColor = color.css();
    viewer.context.getScene().background = new Color(bgColor);
  });

  cj.on("done", color => {
    bgColor = color.css();
    localStorage.setItem('bgColor', bgColor);
  });

  /* ------------------------
     Guide toggle
  ------------------------- */
  guideButton.onclick = () => {
    guideContainer.classList.toggle('hidden');
  };

  /* ------------------------
     Palette toggle
  ------------------------- */
  let palette = false;
  paletteButton.onclick = () => {
    paletteContainer.classList.toggle('hidden');
    palette = !palette;
  };

  /* ------------------------
     Dimension tool
  ------------------------- */
  let dimension = false;

  dimButton.onclick = () => {
    viewer.IFC.selector.unPrepickIfcItems();
    viewer.dimensions.active = !dimension;
    viewer.dimensions.previewActive = !dimension;

    if (!dimension) viewer.dimensions.deleteAll();
    dimension = !dimension;
  };

  /* ------------------------
     File loading
  ------------------------- */
  let properties;

  saveButton.onclick = () => input.click();

  input.onchange = async (event) => {
    properties = await wiv.preprocessAndSaveIfc(viewer, db, event);
  };

  sampleButton.onclick = async () => {
    properties = await wiv.loadSampleIfc(viewer, db);
  };

  removeButton.onclick = () => {
    wiv.releaseMemory(viewer);
    database.removeDatabase(db);
  };

  /* ------------------------
     Button state restore
  ------------------------- */
  const updateButtons = async () => {
    const previousData = localStorage.getItem('modelsNames');
    if (previousData) {
      properties = await database.loadSavedIfc(viewer, db);
    }
  };

  await updateButtons();

  /* ------------------------
     Mouse + keyboard events
  ------------------------- */
  window.onmousemove = () => {
    if (!dimension) viewer.IFC.selector.prePickIfcItem();
  };

  window.onclick = async () => {
    propertiesContainer.textContent = '';

    if (!dimension) {
      const result = await viewer.IFC.selector.pickIfcItem();
      if (!result) {
        viewer.IFC.selector.unpickIfcItems();
        propertiesContainer.classList.add('hidden');
        return;
      }

      const picked = properties[result.id];
      Object.entries(picked).forEach(([key, value]) => {
        const div = document.createElement('div');
        div.textContent = `${key}: ${value}`;
        propertiesContainer.appendChild(div);
      });

      propertiesContainer.classList.remove('hidden');
    }
  };

  window.ondblclick = () => viewer.dimensions.create();

  window.onkeydown = (event) => {
    if (event.code === 'Delete') viewer.dimensions.delete();
    if (event.code === 'Escape') viewer.dimensions.cancelDrawing();
    if (event.code === 'KeyP') viewer.clipper.createPlane();
    if (event.code === 'KeyO') viewer.clipper.deletePlane();
  };

});
