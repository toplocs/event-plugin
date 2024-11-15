const options = [{
  id: 1,
  label: 'Once',
}, {
  id: 2,
  label: 'Weekly',
}, {
  id: 3,
  label: 'Two weeks',
}, {
  id: 4,
  label: 'Four weeks',
}];

const getRecursion = (id: number) => {
  const result = options.find(x => x.id == id);

  return result?.label || 'None';
}

export {
  options,
  getRecursion,
};