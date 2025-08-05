import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Course, CourseFormData } from '../../types/course';
import { courseService } from '../../services/CourseService';

interface CourseFormProps {
  course: Course | null;
  onClose: () => void;
  onSubmit: (success: boolean, message: string) => void;
}

export const CourseForm: React.FC<CourseFormProps> = ({ course, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    provider: '',
    url: '',
    imageUrl: '',
    price: undefined,
    discountPrice: undefined,
    duration: '',
    level: 'iniciante',
    tags: [],
    category: '',
    rating: undefined
  });

  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        provider: course.provider,
        url: course.url,
        imageUrl: course.imageUrl || '',
        price: course.price,
        discountPrice: course.discountPrice,
        duration: course.duration || '',
        level: course.level,
        tags: [...course.tags],
        category: course.category,
        rating: course.rating
      });
    }
  }, [course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'discountPrice' || name === 'rating') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'O título é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'A descrição é obrigatória';
    if (!formData.provider.trim()) newErrors.provider = 'O provedor é obrigatório';
    if (!formData.url.trim()) newErrors.url = 'A URL é obrigatória';
    if (!formData.category.trim()) newErrors.category = 'A categoria é obrigatória';
    if (formData.tags.length === 0) newErrors.tags = 'Adicione pelo menos uma tag';
    
    // Validação de URL
    if (formData.url && !formData.url.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      newErrors.url = 'URL inválida';
    }
    
    // Validação de URL de imagem (se fornecida)
    if (formData.imageUrl && !formData.imageUrl.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      newErrors.imageUrl = 'URL de imagem inválida';
    }
    
    // Validação de preço
    if (formData.price !== undefined && formData.price < 0) {
      newErrors.price = 'O preço não pode ser negativo';
    }
    
    // Validação de preço com desconto
    if (formData.discountPrice !== undefined) {
      if (formData.discountPrice < 0) {
        newErrors.discountPrice = 'O preço com desconto não pode ser negativo';
      }
      if (formData.price !== undefined && formData.discountPrice > formData.price) {
        newErrors.discountPrice = 'O preço com desconto deve ser menor que o preço original';
      }
    }
    
    // Validação de avaliação
    if (formData.rating !== undefined && (formData.rating < 0 || formData.rating > 5)) {
      newErrors.rating = 'A avaliação deve estar entre 0 e 5';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (course) {
        // Atualizar curso existente
        const updatedCourse = courseService.updateCourse(course.id, formData);
        if (updatedCourse) {
          onSubmit(true, 'Curso atualizado com sucesso');
        } else {
          onSubmit(false, 'Erro ao atualizar curso');
        }
      } else {
        // Adicionar novo curso
        courseService.addCourse(formData);
        onSubmit(true, 'Curso adicionado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
      onSubmit(false, 'Erro ao salvar curso');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {course ? 'Editar Curso' : 'Adicionar Curso'}
          </h2>
          <button 
            onClick={onClose}
            className="text-purple-200 hover:text-purple-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-purple-200 mb-1">Título *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full bg-black/20 border ${errors.title ? 'border-red-500' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
                  placeholder="Título do curso"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm text-purple-200 mb-1">Provedor *</label>
                <input
                  type="text"
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  className={`w-full bg-black/20 border ${errors.provider ? 'border-red-500' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
                  placeholder="Ex: Udemy, Coursera, Alura"
                />
                {errors.provider && <p className="text-red-500 text-xs mt-1">{errors.provider}</p>}
              </div>

              <div>
                <label className="block text-sm text-purple-200 mb-1">URL do Curso *</label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className={`w-full bg-black/20 border ${errors.url ? 'border-red-500' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
                  placeholder="https://..."
                />
                {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
              </div>

              <div>
                <label className="block text-sm text-purple-200 mb-1">URL da Imagem</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className={`w-full bg-black/20 border ${errors.imageUrl ? 'border-red-500' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
                  placeholder="https://..."
                />
                {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-purple-200 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price === undefined ? '' : formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full bg-black/20 border ${errors.price ? 'border-red-500' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm text-purple-200 mb-1">Preço com Desconto</label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice === undefined ? '' : formData.discountPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full bg-black/20 border ${errors.discountPrice ? 'border-red-500' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
                    placeholder="0.00"
                  />
                  {errors.discountPrice && <p className="text-red-500 text-xs mt-1">{errors.discountPrice}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-purple-200 mb-1">Descrição *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full bg-black/20 border ${errors.description ? 'border-red-500' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
                  placeholder="Descrição do curso"
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-purple-200 mb-1">Duração</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
                    placeholder="Ex: 4 semanas"
                  />
                </div>

                <div>
                  <label className="block text-sm text-purple-200 mb-1">Nível *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediário">Intermediário</option>
                    <option value="avançado">Avançado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-purple-200 mb-1">Categoria *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full bg-black/20 border ${errors.category ? 'border-red-500' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
                  placeholder="Ex: Programação, Design, Marketing"
                />
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm text-purple-200 mb-1">Avaliação (0-5)</label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating === undefined ? '' : formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className={`w-full bg-black/20 border ${errors.rating ? 'border-red-500' : 'border-white/10'} rounded-lg px-3 py-2 text-white`}
                  placeholder="4.5"
                />
                {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
              </div>

              <div>
                <label className="block text-sm text-purple-200 mb-1">Tags/Habilidades *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white"
                    placeholder="Adicionar tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="p-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {errors.tags && <p className="text-red-500 text-xs mt-1">{errors.tags}</p>}

                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full text-sm text-purple-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-purple-300 hover:text-purple-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-purple-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
            >
              {course ? 'Atualizar Curso' : 'Adicionar Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
