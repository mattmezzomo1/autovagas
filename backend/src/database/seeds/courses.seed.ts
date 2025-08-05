import { DataSource } from 'typeorm';
import { Course, CourseLevel } from '../../courses/entities/course.entity';

export const seedCourses = async (dataSource: DataSource): Promise<void> => {
  const courseRepository = dataSource.getRepository(Course);

  // Check if courses already exist
  const existingCount = await courseRepository.count();
  if (existingCount > 0) {
    console.log('Courses already seeded, skipping...');
    return;
  }

  // Sample courses data
  const coursesData = [
    {
      title: 'JavaScript Completo: Do Zero ao Avançado',
      description: 'Aprenda JavaScript do zero ao avançado com projetos práticos. Domine conceitos fundamentais, ES6+, manipulação do DOM, assincronismo, e frameworks modernos.',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/javascript-completo/',
      imageUrl: 'https://example.com/images/javascript-course.jpg',
      price: 199.99,
      discountPrice: 89.99,
      duration: '40 horas',
      level: CourseLevel.BEGINNER,
      tags: ['JavaScript', 'Frontend', 'Web Development', 'ES6'],
      category: 'Programação',
      rating: 4.8,
      featured: true,
    },
    {
      title: 'React: Desenvolvendo Aplicações Modernas',
      description: 'Aprenda a criar aplicações web modernas com React. Domine componentes, hooks, context API, Redux, e integração com APIs RESTful.',
      provider: 'Alura',
      url: 'https://www.alura.com.br/curso-online-react',
      imageUrl: 'https://example.com/images/react-course.jpg',
      price: 249.99,
      discountPrice: 129.99,
      duration: '35 horas',
      level: CourseLevel.INTERMEDIATE,
      tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
      category: 'Programação',
      rating: 4.7,
      featured: true,
    },
    {
      title: 'Node.js: Construindo APIs Robustas',
      description: 'Aprenda a construir APIs RESTful com Node.js e Express. Domine autenticação, autorização, validação, e integração com bancos de dados.',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/nodejs-apis/',
      imageUrl: 'https://example.com/images/nodejs-course.jpg',
      price: 179.99,
      discountPrice: 99.99,
      duration: '30 horas',
      level: CourseLevel.INTERMEDIATE,
      tags: ['Node.js', 'JavaScript', 'Backend', 'API', 'Express'],
      category: 'Programação',
      rating: 4.6,
      featured: false,
    },
    {
      title: 'Python para Data Science e Machine Learning',
      description: 'Aprenda Python e suas principais bibliotecas para análise de dados e machine learning. Domine NumPy, Pandas, Matplotlib, Scikit-Learn, e TensorFlow.',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/python-data-science',
      imageUrl: 'https://example.com/images/python-ds-course.jpg',
      price: 299.99,
      discountPrice: 149.99,
      duration: '60 horas',
      level: CourseLevel.INTERMEDIATE,
      tags: ['Python', 'Data Science', 'Machine Learning', 'AI'],
      category: 'Data Science',
      rating: 4.9,
      featured: true,
    },
    {
      title: 'UX/UI Design: Princípios e Práticas',
      description: 'Aprenda os princípios fundamentais de UX/UI Design e como aplicá-los em projetos reais. Domine Figma, Adobe XD, e metodologias de design centrado no usuário.',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/uxui-design/',
      imageUrl: 'https://example.com/images/uxui-course.jpg',
      price: 189.99,
      discountPrice: 79.99,
      duration: '25 horas',
      level: CourseLevel.BEGINNER,
      tags: ['UX', 'UI', 'Design', 'Figma', 'Adobe XD'],
      category: 'Design',
      rating: 4.5,
      featured: false,
    },
    {
      title: 'Marketing Digital Completo',
      description: 'Aprenda estratégias de marketing digital para aumentar a visibilidade da sua marca. Domine SEO, mídias sociais, email marketing, e análise de dados.',
      provider: 'Alura',
      url: 'https://www.alura.com.br/curso-online-marketing-digital',
      imageUrl: 'https://example.com/images/marketing-course.jpg',
      price: 159.99,
      discountPrice: 69.99,
      duration: '20 horas',
      level: CourseLevel.BEGINNER,
      tags: ['Marketing', 'SEO', 'Social Media', 'Analytics'],
      category: 'Marketing',
      rating: 4.4,
      featured: false,
    },
    {
      title: 'AWS Certified Solutions Architect',
      description: 'Prepare-se para a certificação AWS Solutions Architect. Aprenda a projetar e implementar sistemas distribuídos na AWS.',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/aws-certified-solutions-architect',
      imageUrl: 'https://example.com/images/aws-course.jpg',
      price: 349.99,
      discountPrice: 199.99,
      duration: '45 horas',
      level: CourseLevel.ADVANCED,
      tags: ['AWS', 'Cloud', 'DevOps', 'Architecture'],
      category: 'Cloud Computing',
      rating: 4.8,
      featured: true,
    },
    {
      title: 'Desenvolvimento Mobile com Flutter',
      description: 'Aprenda a criar aplicativos móveis multiplataforma com Flutter. Domine widgets, gerenciamento de estado, e integração com APIs.',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/flutter-mobile/',
      imageUrl: 'https://example.com/images/flutter-course.jpg',
      price: 219.99,
      discountPrice: 109.99,
      duration: '35 horas',
      level: CourseLevel.INTERMEDIATE,
      tags: ['Flutter', 'Dart', 'Mobile', 'Android', 'iOS'],
      category: 'Desenvolvimento Mobile',
      rating: 4.7,
      featured: false,
    },
    {
      title: 'Gestão Ágil de Projetos com Scrum',
      description: 'Aprenda a gerenciar projetos de forma ágil com Scrum. Domine os papéis, artefatos, e eventos do framework Scrum.',
      provider: 'Alura',
      url: 'https://www.alura.com.br/curso-online-scrum',
      imageUrl: 'https://example.com/images/scrum-course.jpg',
      price: 149.99,
      discountPrice: 59.99,
      duration: '15 horas',
      level: CourseLevel.BEGINNER,
      tags: ['Scrum', 'Agile', 'Project Management'],
      category: 'Gestão',
      rating: 4.5,
      featured: false,
    },
    {
      title: 'Segurança da Informação: Fundamentos e Práticas',
      description: 'Aprenda os fundamentos de segurança da informação e como proteger sistemas e dados. Domine criptografia, autenticação, e prevenção de ataques.',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/information-security',
      imageUrl: 'https://example.com/images/security-course.jpg',
      price: 279.99,
      discountPrice: 139.99,
      duration: '30 horas',
      level: CourseLevel.INTERMEDIATE,
      tags: ['Security', 'Cybersecurity', 'Cryptography', 'Network Security'],
      category: 'Segurança',
      rating: 4.6,
      featured: false,
    },
  ];

  // Insert courses
  for (const courseData of coursesData) {
    const course = courseRepository.create(courseData);
    await courseRepository.save(course);
  }

  console.log('Courses seeded successfully!');
};
