export interface ServicePrice {
  name: string;
  prices: {
    sedan: number;
    suv: number;
    caminhonete: number;
  };
}

export const services: ServicePrice[] = [
  {
    name: 'Lavação Básica',
    prices: { sedan: 60, suv: 70, caminhonete: 80 }
  },
  {
    name: 'Lavação Premium',
    prices: { sedan: 90, suv: 110, caminhonete: 140 }
  },
  {
    name: 'Lavação Detalhada',
    prices: { sedan: 300, suv: 350, caminhonete: 450 }
  }
];

export const waxPrices = {
  sedan: 40,
  suv: 50,
  caminhonete: 60
};

export const getServicePrice = (serviceName: string, carSize: 'sedan' | 'suv' | 'caminhonete'): number => {
  const service = services.find(s => s.name === serviceName);
  return service ? service.prices[carSize] : 0;
};

export const calculateTotal = (
  serviceName: string,
  carSize: 'sedan' | 'suv' | 'caminhonete',
  hasWax: boolean
): number => {
  const servicePrice = getServicePrice(serviceName, carSize);
  const waxPrice = hasWax ? waxPrices[carSize] : 0;
  return servicePrice + waxPrice;
};

export const getAvailableServices = (carSize: 'sedan' | 'suv' | 'caminhonete') => {
  return services.map(service => ({
    name: service.name,
    price: service.prices[carSize]
  }));
};
