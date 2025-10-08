import React, { useState } from 'react';
import { X, Plus, CreditCard, Trash2, Shield, Calendar, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAppStore } from '../../store/appStore';

interface PaymentMethod {
  id: number;
  type: 'credit' | 'debit' | 'pix';
  brand: string;
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
  nickname?: string;
}

interface PaymentMethodsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  isVisible,
  onClose
}) => {
  const { addNotification } = useAppStore();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 1,
      type: 'credit',
      brand: 'Visa',
      lastFour: '4532',
      expiryMonth: 12,
      expiryYear: 2026,
      holderName: 'João da Silva',
      isDefault: true,
      nickname: 'Cartão Principal'
    },
    {
      id: 2,
      type: 'credit',
      brand: 'Mastercard',
      lastFour: '8765',
      expiryMonth: 8,
      expiryYear: 2025,
      holderName: 'João da Silva',
      isDefault: false,
      nickname: 'Cartão Trabalho'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    nickname: ''
  });

  if (!isVisible) return null;

  const getBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return '💳';
    if (brandLower.includes('master')) return '💳';
    if (brandLower.includes('elo')) return '💳';
    return '💳';
  };

  const getBrandColor = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return 'from-blue-600 to-blue-800';
    if (brandLower.includes('master')) return 'from-red-600 to-red-800';
    if (brandLower.includes('elo')) return 'from-yellow-600 to-yellow-800';
    return 'from-gray-600 to-gray-800';
  };

  const handleSetDefault = (methodId: number) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
    addNotification({
      type: 'success',
      message: 'Método de pagamento padrão atualizado!'
    });
  };

  const handleDeleteMethod = (methodId: number) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.isDefault && paymentMethods.length > 1) {
      addNotification({
        type: 'warning',
        message: 'Defina outro cartão como padrão antes de excluir'
      });
      return;
    }

    setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
    addNotification({
      type: 'success',
      message: 'Método de pagamento removido!'
    });
  };

  const handleAddMethod = () => {
    if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cvv || !formData.holderName) {
      addNotification({
        type: 'error',
        message: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    const newMethod: PaymentMethod = {
      id: Date.now(),
      type: 'credit',
      brand: 'Visa', // Seria detectado automaticamente
      lastFour: formData.cardNumber.slice(-4),
      expiryMonth: parseInt(formData.expiryMonth),
      expiryYear: parseInt(formData.expiryYear),
      holderName: formData.holderName,
      isDefault: paymentMethods.length === 0,
      nickname: formData.nickname || undefined
    };

    setPaymentMethods(methods => [...methods, newMethod]);
    setFormData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: '',
      nickname: ''
    });
    setShowAddForm(false);
    
    addNotification({
      type: 'success',
      message: 'Cartão adicionado com sucesso!'
    });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-white text-lg font-semibold">Métodos de Pagamento</h2>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Add New Card Button */}
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 mb-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Novo Cartão
            </Button>
          )}

          {/* Add Card Form */}
          {showAddForm && (
            <Card className="bg-black/20 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  Novo Cartão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Número do Cartão</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                    maxLength={19}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Mês</label>
                    <select
                      value={formData.expiryMonth}
                      onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Ano</label>
                    <select
                      value={formData.expiryYear}
                      onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">AAAA</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={new Date().getFullYear() + i}>
                          {new Date().getFullYear() + i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    maxLength={4}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Nome no Cartão</label>
                  <input
                    type="text"
                    placeholder="João da Silva"
                    value={formData.holderName}
                    onChange={(e) => setFormData({ ...formData, holderName: e.target.value.toUpperCase() })}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Apelido (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Cartão Principal"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        cardNumber: '',
                        expiryMonth: '',
                        expiryYear: '',
                        cvv: '',
                        holderName: '',
                        nickname: ''
                      });
                    }}
                    className="flex-1 border-gray-600 text-gray-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddMethod}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods List */}
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                className={`bg-gradient-to-r ${getBrandColor(method.brand)} border-white/10 ${
                  method.isDefault ? 'ring-2 ring-green-400' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getBrandIcon(method.brand)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-medium text-sm">
                            {method.nickname || `${method.brand} •••• ${method.lastFour}`}
                          </h4>
                          {method.isDefault && (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-gray-200 text-xs">
                          {method.holderName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetDefault(method.id)}
                          className="text-green-300 hover:text-green-200 hover:bg-green-500/10"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMethod(method.id)}
                        className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        <span className="capitalize">{method.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span className="text-green-300">Seguro</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {paymentMethods.length === 0 && !showAddForm && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">Nenhum método de pagamento</h3>
              <p className="text-gray-400 text-sm mb-6">
                Adicione um cartão para facilitar suas compras
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cartão
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-slate-900 border-t border-slate-700 p-4">
        <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
          <Shield className="w-4 h-4 text-green-400" />
          <span>Seus dados são protegidos com criptografia SSL</span>
        </div>
      </div>
    </div>
  );
};
