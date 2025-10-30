import phLocations from 'ph-locations';

interface PhProvince {
  code: string;
  name: string;
  altName: string | null;
  nameTL: string;
  region: string;
}

interface PhCity {
  name: string;
  fullName: string;
  altName: string | null;
  province: string | null;
  classification: string;
  isCapital: boolean;
}

const provinces = phLocations.provinces as PhProvince[];
const citiesMunicipalities = phLocations.citiesMunicipalities as PhCity[];

export function getAllProvinces(): string[] {
  const regularProvinces = provinces.map((p) => p.name);
  const ncrCities = citiesMunicipalities.filter((c) => c.province === null);

  if (ncrCities.length > 0) {
    return ['Metro Manila', ...regularProvinces].sort();
  }

  return regularProvinces.sort();
}

export function getCitiesByProvince(provinceName: string): string[] {
  if (provinceName === 'Metro Manila') {
    return citiesMunicipalities
      .filter((c) => c.province === null)
      .map((c) => c.name)
      .sort();
  }

  const province = provinces.find((p) => p.name === provinceName);
  if (!province) {
    return [];
  }

  return citiesMunicipalities
    .filter((c) => c.province === province.code)
    .map((c) => c.name)
    .sort();
}

export function formatLocation(province: string, city: string): string {
  return `${city}, ${province}`;
}
