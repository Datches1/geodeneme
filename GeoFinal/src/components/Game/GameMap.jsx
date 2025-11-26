import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke } from 'ol/style';
import 'ol/ol.css';

const GameMap = ({ 
  provinceOptions = [], 
  clickedProvince, 
  clickedProvinceCorrect,
  onProvinceClick,
  gameStarted = false
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vectorLayerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
  const [hoveredProvince, setHoveredProvince] = useState(null);

  // Use a ref to keep track of the latest callback without triggering re-renders or re-initialization of the map
  const onProvinceClickRef = useRef(onProvinceClick);
  
  useEffect(() => {
    onProvinceClickRef.current = onProvinceClick;
  }, [onProvinceClick]);

  // Re-render styles when these change
  useEffect(() => {
    if (!vectorLayerRef.current) return;

    const styleFunction = (feature) => {
      const featureName = feature.get('name') || feature.get('NAME') || feature.get('admin');
      if (!featureName) return;

      const fNameLower = featureName.toLocaleLowerCase('tr-TR');
      const hoveredLower = hoveredProvince ? hoveredProvince.toLocaleLowerCase('tr-TR') : '';
      
      // Hover check
      const isHovered = hoveredProvince && fNameLower.includes(hoveredLower);
      
      // Option check
      const isOption = provinceOptions.some(opt => {
        const optName = (opt.name || opt).toLocaleLowerCase('tr-TR').trim();
        const fname = fNameLower.trim();
        
        if (fname === optName) return true;
        if (fname.startsWith(optName) || optName.startsWith(fname)) return true;
        
        if ((optName === 'afyonkarahisar' || optName === 'afyon') && 
            (fname.includes('afyon') || fname.includes('karahisar'))) return true;
        if ((optName === 'sakarya' || optName === 'adapazarı') && 
            (fname.includes('sakarya') || fname.includes('adapazar'))) return true;
        if ((optName === 'kocaeli' || optName === 'izmit') && 
            (fname.includes('kocaeli') || fname.includes('izmit'))) return true;
        
        return fname.includes(optName) || optName.includes(fname);
      });
      
      let fillColor = '#9E9E9E';
      let strokeColor = 'rgba(255, 255, 255, 0.9)';
      let strokeWidth = 2;
      
      // Clicked check
      const isClicked = clickedProvince && fNameLower.includes(clickedProvince.toLocaleLowerCase('tr-TR'));
      
      if (isClicked) {
        fillColor = clickedProvinceCorrect ? '#4CAF50' : '#F44336';
        strokeColor = '#FFFFFF';
        strokeWidth = 3;
      } else if (isOption) {
        fillColor = '#FFA726';
        strokeColor = 'rgba(255, 255, 255, 0.95)';
        strokeWidth = 2.5;
        
        if (isHovered) {
          fillColor = '#FFB74D';
          strokeColor = '#FFFFFF';
          strokeWidth = 3;
        }
      } else if (isHovered) {
        fillColor = '#ADADAD';
        strokeColor = '#FFFFFF';
        strokeWidth = 2.5;
      }
      
      return new Style({
        stroke: new Stroke({
          color: strokeColor,
          width: strokeWidth
        }),
        fill: new Fill({
          color: fillColor
        })
      });
    };

    vectorLayerRef.current.setStyle(styleFunction);
    // Force redraw
    vectorLayerRef.current.changed();

  }, [provinceOptions, clickedProvince, clickedProvinceCorrect, hoveredProvince]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const vectorSource = new VectorSource({
      url: `${import.meta.env.BASE_URL}maps/turkey-full.geojson`,
      format: new GeoJSON()
    });
    
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(255, 255, 255, 0.8)',
          width: 1.5
        }),
        fill: new Fill({
          color: '#9E9E9E'
        })
      })
    });
    vectorLayerRef.current = vectorLayer;

    const map = new Map({
      target: mapRef.current,
      layers: [vectorLayer],
      view: new View({
        center: fromLonLat([35, 38]),
        zoom: 6,
        minZoom: 6,
        maxZoom: 6,
        enableRotation: false,
        constrainResolution: true
      }),
      controls: [],
      interactions: []
    });

    // Click interaction
    map.on('singleclick', (event) => {
      if (!gameStarted) return; // Ignore clicks if game not started

      if (event.originalEvent) {
        event.originalEvent.preventDefault();
        event.originalEvent.stopPropagation();
      }
      
      const feature = map.forEachFeatureAtPixel(
        event.pixel, 
        (feature) => feature,
        { hitTolerance: 5 }
      );
      
      if (feature) {
        const clickedProvinceName = feature.get('name') || feature.get('NAME') || feature.get('admin');
        console.log('Map Clicked:', clickedProvinceName);
        // Use ref to access the latest callback
        if (clickedProvinceName && onProvinceClickRef.current) {
          onProvinceClickRef.current(clickedProvinceName);
        }
      }
    }, [gameStarted]);

    // Hover interaction
    map.on('pointermove', (event) => {
      if (event.dragging) {
        setTooltip(prev => ({ ...prev, visible: false }));
        return;
      }
      
      if (!gameStarted) {
        map.getTargetElement().style.cursor = 'default';
        setTooltip(prev => ({ ...prev, visible: false }));
        setHoveredProvince(null);
        return;
      }
      
      const feature = map.forEachFeatureAtPixel(
        event.pixel, 
        (feature) => feature,
        { hitTolerance: 5 }
      );
      
      const target = map.getTargetElement();
      
      if (feature) {
        const name = feature.get('name') || feature.get('NAME') || feature.get('admin');
        target.style.cursor = 'pointer';
        
        setTooltip({
          visible: true,
          content: name,
          x: event.originalEvent.clientX,
          y: event.originalEvent.clientY
        });
        setHoveredProvince(name);
      } else {
        target.style.cursor = 'default';
        setTooltip(prev => ({ ...prev, visible: false }));
        setHoveredProvince(null);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null);
        mapInstanceRef.current = null;
      }
    };
  }, [gameStarted]); // Re-run when gameStarted changes to update listeners if needed, or better just use ref


  return (
    <>
      <div ref={mapRef} className="map-container"></div>
      {tooltip.visible && (
        <div 
          className="map-tooltip"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 30}px`
          }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  );
};

export default GameMap;

