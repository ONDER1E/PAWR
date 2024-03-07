const locations = {
  'ITKO': [92, 127],
  'IDCS': [97, 146],
  'IPPH': [130, 114],
  'ILKL': [139, 107],
  'IZOL': [174, 76],
  'IJAF': [176, 83],
  'ISCM': [161, 89],
  'ISKP': [143, 62],
  'IBTH': [110, 88],
  'IGRV': [31, 83],
  'IRFD': [80, 49],
  'OWO': [81, 44],
  'IGAR': [78, 56],
  'IBLT': [84, 55],
  'IMLR': [87, 50],
  'ITRC': [88, 39],
  'ISAU': [25, 39],
  'ILAR': [136, 30],
  'IPAP': [152, 28],
  'IBAR': [146, 20],
  'IIAB': [135, 19],
  'IHEN': [129, 17]
}

const regions = {
  "Tokyo Control - 132.300": [[54, 151], [69, 103], [74, 107], [115, 107], [116, 152]],
  "CHICAGO Center - 124.850": [[61, 0], [61, 9], [61, 27], [48, 41], [48, 74], [61, 77], [61, 85], [74, 86], [111, 70], [123, 41]],
  "SOTAF Center - 128.600": [[74, 107], [115, 107], [123, 106], [129, 90], [138, 82], [135, 71], [115, 62], [111, 70], [74, 86], [61, 85], [69, 103], [74, 107]],
  "PERTH Centre - 135.250": [[116, 152], [115, 107], [123, 106], [129, 90], [139, 95], [151, 95], [162, 100], [166, 106], [179, 111], [200, 111]],
  "LAZARUS Center - 126.300": [[88, 0], [88, 27], [106, 30], [110, 38], [123, 41], [121, 46], [155, 54], [165, 45], [200, 37]],
  "NORSOM Center - 125.640": [[200, 37], [165, 45], [155, 54], [154, 65], [158, 73], [146, 74], [135, 71], [138, 82], [129, 90], [139, 95], [151, 95], [162, 100], [166, 106], [179, 111], [200, 111]],
  "KEFLAVIK Control - 126.750": [[54, 151], [69, 103], [61, 85], [61, 77], [48, 74], [48, 47], [26, 56], [0, 59]],
  "BRIGHTON Control - 127.820": [[0, 59], [26, 56], [48, 47], [48, 41], [61, 27], [61, 9], [2, 9]],
  "ISKP - UNICOM 122.8": [[115, 63], [135, 71], [146, 74], [158, 73], [154, 65], [155, 54], [121, 46], [115, 63]],
};

exports.getRegionsAlongPath = function(startLocationName, destinationName) {
  let startLocation = locations[startLocationName]
  let destination = locations[destinationName]
  let path_x1 = startLocation[0];
  let path_y1 = startLocation[1];
  let path_x2 = destination[0];
  let path_y2 = destination[1];
  let getRegionsAlongPathDict = {};
  let startLocationRegion = findStartLocationRegion(startLocation, regions);

  path_m = (path_y2 - path_y1) / (path_x2 - path_x1);
  for (const [key, value] of Object.entries(regions)) {
    for (let i = 0; i < value.length - 1; i++) {
      let x1 = value[i][0];
      let y1 = value[i][1];
      let x2 = value[i + 1][0];
      let y2 = value[i + 1][1];
  
      // Calculate the gradient (m) using the formula: m = (y2 - y1) / (x2 - x1)
      let m = (y2 - y1) / (x2 - x1);

      if (m != path_m) {
        intersect = findIntersection([path_x1, path_y1, path_x2, path_y2], [x1, y1, x2, y2])
        if (intersect != false) {

          let distance = findDistance(intersect, startLocation);

          if (getRegionsAlongPathDict[key] == undefined) {
            getRegionsAlongPathDict[key] = distance;
          }

        }
      }
    }
  }

  let keys = Object.keys(getRegionsAlongPathDict);

  keys.sort((key1, key2) => getRegionsAlongPathDict[key1] - getRegionsAlongPathDict[key2]);

  let getRegionsAlongPathList = [];

  for (let key of keys) {
    getRegionsAlongPathList.push(key);
  }
  
  let index = getRegionsAlongPathList.indexOf(startLocationRegion);
  if (index !== -1) {
    getRegionsAlongPathList.splice(index, 1);
    getRegionsAlongPathList.unshift(startLocationRegion);
  }

  return getRegionsAlongPathList

}

function findIntersection(line1, line2) {
  let [x1, y1, x2, y2] = line1;
  let [path_x1, path_y1, path_x2, path_y2] = line2;

  // Calculate slopes (m1 and m2) and y-intercepts (b1 and b2)
  let m1 = (y2 - y1) / (x2 - x1);
  let b1 = y1 - m1 * x1;

  let m2 = (path_y2 - path_y1) / (path_x2 - path_x1);
  let b2 = path_y1 - m2 * path_x1;

  // Check if lines are parallel (no intersection or infinite intersection points)
  if (m1 === m2) {
    return null; // Lines are parallel, no intersection or infinite intersection points
  }

  // Calculate intersection point (x, y)
  let x = (b2 - b1) / (m1 - m2);
  let y = m1 * x + b1;

  // Check if intersection point is within the parameter range of both lines
  if (
    x >= Math.min(x1, x2) && x <= Math.max(x1, x2) &&
    x >= Math.min(path_x1, path_x2) && x <= Math.max(path_x1, path_x2) &&
    y >= Math.min(y1, y2) && y <= Math.max(y1, y2) &&
    y >= Math.min(path_y1, path_y2) && y <= Math.max(path_y1, path_y2)
  ) {
    return [x, y];
  } else {
    return false; // Intersection point lies outside the parameter range of either line
  }
}

function findDistance(point1, point2) {
  let [x1, y1] = point1;
  let [x2, y2] = point2;
  
  // Calculate the distance using the Pythagorean theorem
  let distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  return distance;
}

function isPointInPolygon(point, polygon) {
  let x = point[0];
  let y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i][0];
    let yi = polygon[i][1];
    let xj = polygon[j][0];
    let yj = polygon[j][1];

    let intersect =
      ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

function findStartLocationRegion(coordinates, regions) {
  // Iterate through each region in the regions object
  for (let regionKey in regions) {
    // Check if the coordinates are within the current region
    if (isPointInPolygon(coordinates, regions[regionKey])) {
      return regionKey; // Return the key of the matching region
    }
  }

  // Return null if the coordinates are not within any region
  return null;
}
