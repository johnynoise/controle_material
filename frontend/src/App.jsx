import React, { useEffect, useState } from "react";
import { 
  Package, Search, Plus, Edit2, Trash2, AlertCircle, CheckCircle, X, Save, 
  TrendingUp, TrendingDown, History, BarChart3, Filter, FileText, Download,
  AlertTriangle, Archive, Eye, Calendar, Users, Loader2
} from "lucide-react";
import { CSVLink } from "react-csv";

export default function App() {
  const [materiais, setMateriais] = useState([]);
  const [filteredMateriais, setFilteredMateriais] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("ativos");
  const [showModal, setShowModal] = useState(false);
  const [showMovimentacaoModal, setShowMovimentacaoModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [showRelatorioModal, setShowRelatorioModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [materialSelecionado, setMaterialSelecionado] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("estoque");
  const [loading, setLoading] = useState(false);
  
  const [novoMaterial, setNovoMaterial] = useState({
    nome: "",
    descricao: "",
    quantidade: 0,
    localizacao: "",
    estoqueMinimo: 5,
    categoria: ""
  });

  const [movimentacao, setMovimentacao] = useState({
    quantidade: 0,
    tipo: "saida",
    tecnico: "",
    observacao: ""
  });

  const [filtroRelatorio, setFiltroRelatorio] = useState({
    dataInicio: "",
    dataFim: "",
    tipo: ""
  });

  const [errors, setErrors] = useState({});

  const categorias = ["Periféricos", "Componentes", "Cabos", "Acessórios", "Ferramentas", "Consumíveis"];

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [searchTerm, materiais, filtroCategoria, filtroStatus]);

  const carregarDados = async () => {
    setLoading(true);
    await Promise.all([
      carregarMateriais(),
      carregarMovimentacoes(),
      carregarEstatisticas()
    ]).catch(() => {});
    setLoading(false);
  };

  const carregarMateriais = async () => {
    try {
      const response = await fetch("http://localhost:3001/materiais");
      const data = await response.json();
      setMateriais(data);
    } catch (error) {
      showAlert("Erro ao carregar materiais", "error");
    }
  };

  const carregarMovimentacoes = async () => {
    try {
      const response = await fetch("http://localhost:3001/movimentacoes?limit=50");
      const data = await response.json();
      setMovimentacoes(data);
    } catch (error) {
      console.error("Erro ao carregar movimentações:", error);
    }
  };

  const carregarEstatisticas = async () => {
    try {
      const response = await fetch("http://localhost:3001/estatisticas");
      const data = await response.json();
      setEstatisticas(data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const aplicarFiltros = () => {
    let filtered = materiais.filter(m => {
      const matchSearch = 
        m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.localizacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategoria = !filtroCategoria || m.categoria === filtroCategoria;
      
      const matchStatus = 
        filtroStatus === "todos" ||
        (filtroStatus === "ativos" && m.ativo) ||
        (filtroStatus === "baixoEstoque" && m.ativo && m.quantidade <= m.estoqueMinimo) ||
        (filtroStatus === "zerados" && m.ativo && m.quantidade === 0) ||
        (filtroStatus === "inativos" && !m.ativo);

      return matchSearch && matchCategoria && matchStatus;
    });

    setFilteredMateriais(filtered);
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3500);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!novoMaterial.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!novoMaterial.descricao.trim()) newErrors.descricao = "Descrição é obrigatória";
    if (novoMaterial.quantidade < 0) newErrors.quantidade = "Quantidade não pode ser negativa";
    if (!novoMaterial.localizacao.trim()) newErrors.localizacao = "Localização é obrigatória";
    if (novoMaterial.estoqueMinimo < 0) newErrors.estoqueMinimo = "Estoque mínimo inválido";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMovimentacao = () => {
    const newErrors = {};
    if (!movimentacao.quantidade || movimentacao.quantidade <= 0) {
      newErrors.quantidade = "Quantidade deve ser maior que zero";
    }
    if (movimentacao.tipo === "saida" && materialSelecionado && movimentacao.quantidade > materialSelecionado.quantidade) {
      newErrors.quantidade = "Quantidade maior que o estoque disponível";
    }
    if (!movimentacao.tecnico.trim()) {
      newErrors.tecnico = "Nome do técnico é obrigatório";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const adicionarMaterial = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        nome: novoMaterial.nome.trim(),
        descricao: novoMaterial.descricao.trim(),
        quantidade: Number(novoMaterial.quantidade),
        localizacao: novoMaterial.localizacao.trim(),
        estoqueMinimo: Number(novoMaterial.estoqueMinimo),
        categoria: novoMaterial.categoria || null
      };
      
      const response = await fetch("http://localhost:3001/materiais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro no servidor');

      await carregarDados();
      setNovoMaterial({ nome: "", descricao: "", quantidade: 0, localizacao: "", estoqueMinimo: 5, categoria: "" });
      setShowModal(false);
      setErrors({});
      showAlert("Material adicionado com sucesso!", "success");
    } catch (error) {
      showAlert(error.message || "Erro ao adicionar material", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const atualizarMaterial = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        ...novoMaterial,
        quantidade: Number(novoMaterial.quantidade),
        estoqueMinimo: Number(novoMaterial.estoqueMinimo)
      };
      
      const response = await fetch(`http://localhost:3001/materiais/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro no servidor');

      await carregarDados();
      setNovoMaterial({ nome: "", descricao: "", quantidade: 0, localizacao: "", estoqueMinimo: 5, categoria: "" });
      setShowModal(false);
      setEditingId(null);
      setErrors({});
      showAlert("Material atualizado com sucesso!", "success");
    } catch (error) {
      showAlert(error.message || "Erro ao atualizar material", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletarMaterial = async (id) => {
    if (!window.confirm("Tem certeza que deseja desativar este material?")) return;

    try {
      const response = await fetch(`http://localhost:3001/materiais/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao desativar material");

      await carregarDados();
      showAlert("Material desativado com sucesso!", "success");
    } catch (error) {
      showAlert(error.message || "Erro ao desativar material", "error");
    }
  };

  const processarMovimentacao = async () => {
    if (!validateMovimentacao()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:3001/movimentacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: materialSelecionado.id,
          tipo: movimentacao.tipo,
          quantidade: Number(movimentacao.quantidade),
          tecnico: movimentacao.tecnico.trim(),
          observacao: movimentacao.observacao?.trim() || null
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro no servidor');

      await carregarDados();
      setShowMovimentacaoModal(false);
      setMaterialSelecionado(null);
      setErrors({});
      showAlert(`${movimentacao.tipo === "entrada" ? "Entrada" : "Saída"} registrada com sucesso!`, "success");
    } catch (error) {
      showAlert(error.message || "Erro ao processar movimentação", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const abrirHistorico = async (material) => {
    try {
      const response = await fetch(`http://localhost:3001/materiais/${material.id}`);
      const data = await response.json();
      setMaterialSelecionado(data);
      setShowHistoricoModal(true);
    } catch (error) {
      showAlert("Erro ao carregar histórico", "error");
    }
  };

  const gerarRelatorio = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroRelatorio.dataInicio) params.append('dataInicio', filtroRelatorio.dataInicio);
      if (filtroRelatorio.dataFim) params.append('dataFim', filtroRelatorio.dataFim);
      if (filtroRelatorio.tipo) params.append('tipo', filtroRelatorio.tipo);

      const response = await fetch(`http://localhost:3001/relatorios/movimentacoes?${params}`);
      const data = await response.json();
      console.log("Relatório:", data);
      setShowRelatorioModal(false);
      showAlert("Relatório gerado com sucesso! Você pode baixar em CSV.", "success");
    } catch (error) {
      showAlert("Erro ao gerar relatório", "error");
    }
  };

  const getStatusColor = (material) => {
    if (!material.ativo) return "text-gray-600 bg-gray-50";
    if (material.quantidade === 0) return "text-red-600 bg-red-50";
    if (material.quantidade <= material.estoqueMinimo) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getStatusBadge = (material) => {
    if (!material.ativo) return { text: "Inativo", icon: Archive };
    if (material.quantidade === 0) return { text: "Zerado", icon: AlertCircle };
    if (material.quantidade <= material.estoqueMinimo) return { text: "Baixo", icon: AlertTriangle };
    return { text: "Normal", icon: CheckCircle };
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleString('pt-BR');
    } catch (e) {
      return date;
    }
  };

  // --- Helpers para CSV / Export ---
  const csvData = (items) => {
    return items.map(m => ({
      id: m.id,
      nome: m.nome,
      descricao: m.descricao,
      quantidade: m.quantidade,
      estoqueMinimo: m.estoqueMinimo,
      categoria: m.categoria,
      localizacao: m.localizacao,
      ativo: m.ativo ? 'Sim' : 'Não',
      atualizadoEm: formatDate(m.atualizadoEm)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Alert */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
          alert.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white animate-fade-in`}>
          {alert.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Package className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Controle de Estoque TI</h1>
                <p className="text-slate-600 text-sm">Sistema completo de gerenciamento e auditoria</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRelatorioModal(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <FileText size={18} />
                Relatórios
              </button>

              <CSVLink data={csvData(materiais)} filename={"materiais_export.csv"} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-slate-700">
                <Download size={16} /> Exportar CSV
              </CSVLink>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b">
            <button
              onClick={() => setActiveTab("estoque")}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === "estoque"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Package size={18} />
                Estoque
              </div>
            </button>
            <button
              onClick={() => setActiveTab("movimentacoes")}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === "movimentacoes"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <History size={18} />
                Movimentações
              </div>
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === "dashboard"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={18} />
                Dashboard
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin" />
            <span className="ml-2 text-slate-600">Carregando...</span>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && estatisticas && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total de Materiais</p>
                    <p className="text-3xl font-bold text-slate-800">{estatisticas.totalMateriais}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Materiais Ativos</p>
                    <p className="text-3xl font-bold text-green-600">{estatisticas.materiaisAtivos}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Baixo Estoque</p>
                    <p className="text-3xl font-bold text-yellow-600">{estatisticas.materiaisBaixoEstoque}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="text-yellow-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Movimentações Hoje</p>
                    <p className="text-3xl font-bold text-purple-600">{estatisticas.movimentacoesHoje}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Categorias */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Materiais por Categoria</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {estatisticas.categorias.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-700">{cat.nome}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                      {cat.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Movimentações Tab */}
        {activeTab === "movimentacoes" && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-slate-800">Histórico de Movimentações</h2>
            </div>
            <div className="p-6">
              {movimentacoes.length === 0 ? (
                <div className="text-center py-12">
                  <History className="mx-auto text-slate-300 mb-4" size={64} />
                  <p className="text-slate-600">Nenhuma movimentação registrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {movimentacoes.map((mov) => (
                    <div key={mov.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${
                          mov.tipo === "entrada" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {mov.tipo === "entrada" ? (
                            <TrendingUp className={mov.tipo === "entrada" ? "text-green-600" : "text-red-600"} size={20} />
                          ) : (
                            <TrendingDown className="text-red-600" size={20} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-800">{mov.material.nome}</p>
                            <span className="text-sm text-slate-500">
                              {mov.material.categoria && `• ${mov.material.categoria}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {mov.tecnico}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(mov.dataHora)}
                            </span>
                          </div>
                          {mov.observacao && (
                            <p className="text-sm text-slate-500 mt-1 italic">{mov.observacao}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          mov.tipo === "entrada" ? "text-green-600" : "text-red-600"
                        }`}>
                          {mov.tipo === "entrada" ? "+" : "-"}{mov.quantidade} un
                        </p>
                        <p className="text-xs text-slate-500">
                          {mov.quantidadeAnterior} → {mov.quantidadeAtual}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estoque Tab */}
        {activeTab === "estoque" && (
          <>
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex gap-4 flex-wrap items-center mb-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar materiais..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNovoMaterial({ nome: "", descricao: "", quantidade: 0, localizacao: "", estoqueMinimo: 5, categoria: "" });
                    setEditingId(null);
                    setErrors({});
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  Novo Material
                </button>
              </div>

              {/* Filtros */}
              <div className="flex gap-3 flex-wrap">
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Todas categorias</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="ativos">Ativos</option>
                  <option value="baixoEstoque">Baixo Estoque</option>
                  <option value="zerados">Zerados</option>
                  <option value="inativos">Inativos</option>
                  <option value="todos">Todos</option>
                </select>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFiltroCategoria("");
                    setFiltroStatus("ativos");
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Limpar filtros
                </button>
              </div>
            </div>

            {/* Lista de Materiais */}
            <div className="grid gap-4">
              {filteredMateriais.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Package className="mx-auto text-slate-300 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">Nenhum material encontrado</h3>
                  <p className="text-slate-500">Ajuste os filtros ou adicione novos materiais</p>
                </div>
              ) : (
                filteredMateriais.map((material) => {
                  const status = getStatusBadge(material);
                  const StatusIcon = status.icon;

                  return (
                    <div key={material.id} className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all border-l-4 ${
                      !material.ativo ? "border-gray-400" :
                      material.quantidade === 0 ? "border-red-500" :
                      material.quantidade <= material.estoqueMinimo ? "border-yellow-500" :
                      "border-green-500"
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-semibold text-slate-800">{material.nome}</h3>
                            
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(material)}`}>
                              <StatusIcon size={14} />
                              {material.quantidade} un.
                            </span>

                            {material.categoria && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {material.categoria}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-slate-600 mb-3">{material.descricao}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Package size={16} />
                              {material.localizacao}
                            </span>
                            <span>Estoque mínimo: {material.estoqueMinimo}</span>
                            <span>Última atualização: {formatDate(material.atualizadoEm)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirHistorico(material)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Ver histórico"
                          >
                            <History size={20} />
                          </button>
                          {material.ativo && (
                            <button
                              onClick={() => {
                                setMaterialSelecionado(material);
                                setMovimentacao({ quantidade: 0, tipo: "saida", tecnico: "", observacao: "" });
                                setErrors({});
                                setShowMovimentacaoModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Registrar movimentação"
                            >
                              <TrendingUp size={20} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setNovoMaterial({
                                nome: material.nome,
                                descricao: material.descricao,
                                quantidade: material.quantidade,
                                localizacao: material.localizacao,
                                estoqueMinimo: material.estoqueMinimo,
                                categoria: material.categoria || ""
                              });
                              setEditingId(material.id);
                              setShowModal(true);
                            }}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => deletarMaterial(material.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Desativar"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Modais - Material */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingId ? 'Editar Material' : 'Novo Material'}</h3>
              <button onClick={() => { setShowModal(false); setEditingId(null); setErrors({}); }} className="p-2 rounded-full hover:bg-slate-100">
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nome</label>
                <input value={novoMaterial.nome} onChange={(e) => setNovoMaterial(prev => ({...prev, nome: e.target.value}))} className={`mt-1 w-full px-3 py-2 border rounded-lg outline-none ${errors.nome ? 'border-red-400' : 'border-slate-200'}`} />
                {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Categoria</label>
                <select value={novoMaterial.categoria} onChange={(e) => setNovoMaterial(prev => ({...prev, categoria: e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg outline-none border-slate-200">
                  <option value="">Selecione</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Descrição</label>
                <textarea value={novoMaterial.descricao} onChange={(e) => setNovoMaterial(prev => ({...prev, descricao: e.target.value}))} className={`mt-1 w-full px-3 py-2 border rounded-lg outline-none ${errors.descricao ? 'border-red-400' : 'border-slate-200'}`} rows={3} />
                {errors.descricao && <p className="text-xs text-red-500 mt-1">{errors.descricao}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Quantidade</label>
                <input type="number" value={novoMaterial.quantidade} onChange={(e) => setNovoMaterial(prev => ({...prev, quantidade: Number(e.target.value)}))} className={`mt-1 w-full px-3 py-2 border rounded-lg outline-none ${errors.quantidade ? 'border-red-400' : 'border-slate-200'}`} />
                {errors.quantidade && <p className="text-xs text-red-500 mt-1">{errors.quantidade}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Estoque Mínimo</label>
                <input type="number" value={novoMaterial.estoqueMinimo} onChange={(e) => setNovoMaterial(prev => ({...prev, estoqueMinimo: Number(e.target.value)}))} className={`mt-1 w-full px-3 py-2 border rounded-lg outline-none ${errors.estoqueMinimo ? 'border-red-400' : 'border-slate-200'}`} />
                {errors.estoqueMinimo && <p className="text-xs text-red-500 mt-1">{errors.estoqueMinimo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Localização</label>
                <input value={novoMaterial.localizacao} onChange={(e) => setNovoMaterial(prev => ({...prev, localizacao: e.target.value}))} className={`mt-1 w-full px-3 py-2 border rounded-lg outline-none ${errors.localizacao ? 'border-red-400' : 'border-slate-200'}`} />
                {errors.localizacao && <p className="text-xs text-red-500 mt-1">{errors.localizacao}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setErrors({}); }} className="px-4 py-2 rounded-lg hover:bg-slate-100">Cancelar</button>
              {editingId ? (
                <button onClick={atualizarMaterial} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Salvar alterações
                </button>
              ) : (
                <button onClick={adicionarMaterial} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Adicionar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Movimentação */}
      {showMovimentacaoModal && materialSelecionado && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Registrar Movimentação - {materialSelecionado.nome}</h3>
              <button onClick={() => { setShowMovimentacaoModal(false); setMaterialSelecionado(null); setErrors({}); }} className="p-2 rounded-full hover:bg-slate-100">
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="tipo" checked={movimentacao.tipo === 'saida'} onChange={() => setMovimentacao(prev => ({...prev, tipo: 'saida'}))} />
                  Saída
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="tipo" checked={movimentacao.tipo === 'entrada'} onChange={() => setMovimentacao(prev => ({...prev, tipo: 'entrada'}))} />
                  Entrada
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Quantidade</label>
                <input type="number" value={movimentacao.quantidade} onChange={(e) => setMovimentacao(prev => ({...prev, quantidade: Number(e.target.value)}))} className={`mt-1 w-full px-3 py-2 border rounded-lg outline-none ${errors.quantidade ? 'border-red-400' : 'border-slate-200'}`} />
                {errors.quantidade && <p className="text-xs text-red-500 mt-1">{errors.quantidade}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Técnico</label>
                <input value={movimentacao.tecnico} onChange={(e) => setMovimentacao(prev => ({...prev, tecnico: e.target.value}))} className={`mt-1 w-full px-3 py-2 border rounded-lg outline-none ${errors.tecnico ? 'border-red-400' : 'border-slate-200'}`} />
                {errors.tecnico && <p className="text-xs text-red-500 mt-1">{errors.tecnico}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Observação</label>
                <textarea value={movimentacao.observacao} onChange={(e) => setMovimentacao(prev => ({...prev, observacao: e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg outline-none border-slate-200" rows={3} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowMovimentacaoModal(false); setMaterialSelecionado(null); setErrors({}); }} className="px-4 py-2 rounded-lg hover:bg-slate-100">Cancelar</button>
              <button onClick={processarMovimentacao} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historico */}
      {showHistoricoModal && materialSelecionado && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Histórico - {materialSelecionado.nome}</h3>
              <button onClick={() => { setShowHistoricoModal(false); setMaterialSelecionado(null); }} className="p-2 rounded-full hover:bg-slate-100">
                <X />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-auto">
              {materialSelecionado.movimentacoes && materialSelecionado.movimentacoes.length > 0 ? (
                materialSelecionado.movimentacoes.map(mov => (
                  <div key={mov.id} className="p-3 bg-slate-50 rounded-lg flex items-start gap-3">
                    <div className={`p-2 rounded-md ${mov.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {mov.tipo === 'entrada' ? <TrendingUp className="text-green-600" /> : <TrendingDown className="text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-700">{mov.tecnico} • {formatDate(mov.dataHora)}</div>
                        <div className={`font-semibold ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>{mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade} un</div>
                      </div>
                      {mov.observacao && <div className="text-sm text-slate-500 mt-1">{mov.observacao}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">Nenhuma movimentação encontrada para este material.</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <CSVLink data={csvData(materialSelecionado.movimentacoes || [])} filename={`historico_${materialSelecionado.id}.csv`} className="px-4 py-2 bg-slate-100 rounded-lg">Exportar CSV</CSVLink>
              <button onClick={() => { setShowHistoricoModal(false); setMaterialSelecionado(null); }} className="px-4 py-2 rounded-lg hover:bg-slate-100">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Relatório (filtro) */}
      {showRelatorioModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Gerar Relatório de Movimentações</h3>
              <button onClick={() => setShowRelatorioModal(false)} className="p-2 rounded-full hover:bg-slate-100"><X /></button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Data início</label>
                <input type="date" value={filtroRelatorio.dataInicio} onChange={(e) => setFiltroRelatorio(prev => ({...prev, dataInicio: e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg outline-none border-slate-200" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Data fim</label>
                <input type="date" value={filtroRelatorio.dataFim} onChange={(e) => setFiltroRelatorio(prev => ({...prev, dataFim: e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg outline-none border-slate-200" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Tipo</label>
                <select value={filtroRelatorio.tipo} onChange={(e) => setFiltroRelatorio(prev => ({...prev, tipo: e.target.value}))} className="mt-1 w-full px-3 py-2 border rounded-lg outline-none border-slate-200">
                  <option value="">Todos</option>
                  <option value="entrada">Entradas</option>
                  <option value="saida">Saídas</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowRelatorioModal(false)} className="px-4 py-2 rounded-lg hover:bg-slate-100">Cancelar</button>
              <button onClick={gerarRelatorio} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Gerar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
