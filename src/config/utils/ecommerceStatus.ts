const ECOMMERCE_STATUS = {
  ACTIVE: 'ACTIVE', // ecommerce está ativo e funcionando
  PAUSED: 'PAUSED', // ecommerce está pausado e será deletado em até 5 dias
  DELETED: 'DELETED', // ecommerce com soft delete e não pode ser acessado pelo cliente, somente pelo admin
};

export default ECOMMERCE_STATUS;
