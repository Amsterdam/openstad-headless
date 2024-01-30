import { TileLayer as LeafletTileLayer } from 'react-leaflet'
import type { MapTilesProps } from './types/map-tiles-props';

export default function TileLayer({
  tilesVariant = 'default',
  tiles = null,
  minZoom = 0,
  maxZoom = 25,
  ...props
}: MapTilesProps) {

  switch(tilesVariant) {

		case "amaps":
      return (
				<LeafletTileLayer
        {...props}
	      attribution="amsterdam.nl"
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 21 }
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 11 }
	      subdomains="1234"
        url="https://t{s}.data.amsterdam.nl/topo_wm/{z}/{x}/{y}.png"
          />)

		case "openstreetmaps":
      return (
        <LeafletTileLayer
        {...props}
        attribution="<a href='https://www.openstreetmap.org/copyright'>© OpenStreetMap contributors</a>"
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 0 }
        subdomains="abc"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />)

		case "n3s":
      return (
        <LeafletTileLayer
        {...props}
	      attribution=""
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 0 }
        subdomains="abcd"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />)

		case "custom":
      return (
        <LeafletTileLayer
        {...props}
        attribution={tiles && tiles.attribution || ''}
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 0 }
        subdomains={tiles && tiles.subdomains || ''}
        url={tiles && tiles.url || 'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png'}
          />)

		default:
		case "nlmaps":
      return (
        <LeafletTileLayer
        {...props}
	      attribution="Kaartgegevens &copy; <a href='kadaster.nl'>Kadaster</a>"
	      bounds={[[50.5, 3.25], [54, 7.6]]}
	      maxZoom={ typeof maxZoom != 'undefined' ? maxZoom : 19 }
	      minZoom={ typeof minZoom != 'undefined' ? minZoom : 6 }
        subdomains=''
        url="https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png"
          />)

	}

}
