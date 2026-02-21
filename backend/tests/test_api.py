"""
Тесты для API SkySwag
Запуск: python -m unittest tests/test_api.py -v
"""

import unittest
import sys
import os
import re

# Добавляем путь к родительской папке
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Отключаем эмодзи и спецсимволы для Windows
USE_EMOJI = False

if USE_EMOJI:
    CHECK_MARK = "✅"
    CROSS_MARK = "❌"
    WARNING_MARK = "⚠️"
    INFO_MARK = "ℹ️"
    ROCKET_MARK = "🚀"
    PACKAGE_MARK = "📦"
    FILTER_MARK = "🔍"
    TEST_MARK = "🧪"
    CLOCK_MARK = "⏱️"
else:
    CHECK_MARK = "[OK]"
    CROSS_MARK = "[FAIL]"
    WARNING_MARK = "[WARN]"
    INFO_MARK = "[INFO]"
    ROCKET_MARK = "[TEST]"
    PACKAGE_MARK = "[PROD]"
    FILTER_MARK = "[FILTER]"
    TEST_MARK = "[TEST]"
    CLOCK_MARK = "[TIME]"

print(f"{INFO_MARK} Загрузка тестов...")

class TestProducts(unittest.TestCase):
    """Тестирование продуктов"""
    
    @classmethod
    def setUpClass(cls):
        """Выполняется один раз перед всеми тестами"""
        print(f"\n{PACKAGE_MARK} Тестирование продуктов...")
        cls.products = [
            {"id": "1", "name": "Airbus H130", "price": 6100000, "year": 2025},
            {"id": "2", "name": "Airbus H125", "price": 4550000, "year": 2024},
            {"id": "3", "name": "Robinson R66", "price": 1600000, "year": 2025}
        ]
    
    def test_1_product_count(self):
        """Тест 1: Количество продуктов"""
        self.assertEqual(len(self.products), 3)
        print(f"  {CHECK_MARK} Тест 1 пройден: количество продуктов")
    
    def test_2_product_structure(self):
        """Тест 2: Структура продукта"""
        product = self.products[0]
        self.assertIn('id', product)
        self.assertIn('name', product)
        self.assertIn('price', product)
        self.assertIn('year', product)
        print(f"  {CHECK_MARK} Тест 2 пройден: структура продукта")
    
    def test_3_price_positive(self):
        """Тест 3: Цены положительные"""
        for product in self.products:
            self.assertGreater(product['price'], 0)
        print(f"  {CHECK_MARK} Тест 3 пройден: цены положительные")
    
    def test_4_year_range(self):
        """Тест 4: Год в разумных пределах"""
        for product in self.products:
            self.assertGreaterEqual(product['year'], 2000)
            self.assertLessEqual(product['year'], 2030)
        print(f"  {CHECK_MARK} Тест 4 пройден: год в пределах")
    
    def test_5_unique_ids(self):
        """Тест 5: Уникальные ID"""
        ids = [p['id'] for p in self.products]
        self.assertEqual(len(ids), len(set(ids)))
        print(f"  {CHECK_MARK} Тест 5 пройден: уникальные ID")

class TestFilters(unittest.TestCase):
    """Тестирование фильтров"""
    
    def setUp(self):
        self.products = [
            {"name": "Airbus H130", "price": 6100000},
            {"name": "Airbus H125", "price": 4550000},
            {"name": "Robinson R66", "price": 1600000}
        ]
    
    def test_1_search_filter(self):
        """Тест 1: Поиск по названию"""
        # Поиск Airbus
        result = [p for p in self.products if 'Airbus' in p['name']]
        self.assertEqual(len(result), 2)
        
        # Поиск Robinson
        result = [p for p in self.products if 'Robinson' in p['name']]
        self.assertEqual(len(result), 1)
        
        # Поиск несуществующего
        result = [p for p in self.products if 'Boeing' in p['name']]
        self.assertEqual(len(result), 0)
        print(f"  {CHECK_MARK} Тест 1 пройден: поиск")
    
    def test_2_price_filter(self):
        """Тест 2: Фильтр по цене"""
        # От 2 до 5 миллионов
        result = [p for p in self.products if 2000000 <= p['price'] <= 5000000]
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['name'], "Airbus H125")
        
        # От 0 до 2 миллионов
        result = [p for p in self.products if 0 <= p['price'] <= 2000000]
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['name'], "Robinson R66")
        print(f"  {CHECK_MARK} Тест 2 пройден: фильтр по цене")
    
    def test_3_sort_asc(self):
        """Тест 3: Сортировка по возрастанию"""
        sorted_products = sorted(self.products, key=lambda x: x['price'])
        prices = [p['price'] for p in sorted_products]
        self.assertEqual(prices, [1600000, 4550000, 6100000])
        print(f"  {CHECK_MARK} Тест 3 пройден: сортировка по возрастанию")
    
    def test_4_sort_desc(self):
        """Тест 4: Сортировка по убыванию"""
        sorted_products = sorted(self.products, key=lambda x: x['price'], reverse=True)
        prices = [p['price'] for p in sorted_products]
        self.assertEqual(prices, [6100000, 4550000, 1600000])
        print(f"  {CHECK_MARK} Тест 4 пройден: сортировка по убыванию")

class TestValidation(unittest.TestCase):
    """Тестирование валидации"""
    
    def validate_email_strict(self, email):
        """
        Строгая валидация email
        Запрещает: .., .@, @., двойные точки, короткие домены
        """
        if not email or not isinstance(email, str):
            return False
        
        # Проверка на пустоту
        if len(email) < 5:
            return False
        
        # Должен содержать @
        if '@' not in email:
            return False
        
        # Разделяем на локальную часть и домен
        parts = email.split('@')
        if len(parts) != 2:
            return False
        
        local, domain = parts
        
        # Локальная часть не должна быть пустой
        if not local or len(local) < 1:
            return False
        
        # Домен не должен быть пустым
        if not domain or len(domain) < 3:
            return False
        
        # Запрещаем двойные точки
        if '..' in local or '..' in domain:
            return False
        
        # Запрещаем точки в начале или конце
        if local.startswith('.') or local.endswith('.'):
            return False
        
        if domain.startswith('.') or domain.endswith('.'):
            return False
        
        # Домен должен содержать хотя бы одну точку
        if '.' not in domain:
            return False
        
        # Проверка на последовательность .@ или @.
        if email.find('.@') != -1 or email.find('@.') != -1:
            return False
        
        # Проверка на длину последней части домена (должна быть >= 2)
        domain_parts = domain.split('.')
        if len(domain_parts[-1]) < 2:
            return False
        
        return True
    
    def test_1_phone_validation(self):
        """Тест 1: Валидация телефона"""
        def validate_phone(phone):
            if not phone:
                return False
            digits = ''.join(filter(str.isdigit, phone))
            return 10 <= len(digits) <= 15
        
        valid_phones = [
            "+79991234567",
            "89991234567",
            "8 (999) 123-45-67",
            "+1 234 567 8900"
        ]
        
        invalid_phones = [
            "",
            "123",
            "abc",
            "+7"
        ]
        
        for phone in valid_phones:
            self.assertTrue(validate_phone(phone), f"Должно быть True: {phone}")
        
        for phone in invalid_phones:
            self.assertFalse(validate_phone(phone), f"Должно быть False: {phone}")
        
        print(f"  {CHECK_MARK} Тест 1 пройден: валидация телефона")
    
    def test_2_name_validation(self):
        """Тест 2: Валидация имени"""
        def validate_name(name):
            return name and len(name.strip()) >= 2
        
        self.assertTrue(validate_name("Иван"))
        self.assertTrue(validate_name("Анна"))
        self.assertFalse(validate_name(""))
        self.assertFalse(validate_name("A"))
        print(f"  {CHECK_MARK} Тест 2 пройден: валидация имени")
    
    def test_3_email_valid_common(self):
        """Тест 3: Обычные валидные email адреса"""
        valid_emails = [
            "test@test.com",
            "user.name@domain.com",
            "user+label@domain.org",
            "user123@domain.co.uk",
            "first.last@sub.domain.com",
            "email@domain.ru",
            "email@domain.io",
            "email@domain.co",
            "email@domain.ai",
            "email@domain.tv"
        ]
        
        for email in valid_emails:
            self.assertTrue(self.validate_email_strict(email), 
                          f"Должно быть True: {email}")
        
        print(f"  {CHECK_MARK} Тест 3 пройден: валидные email")
    
    def test_4_email_invalid_obvious(self):
        """Тест 4: Очевидно невалидные email адреса"""
        invalid_emails = [
            "",                          # Пустой
            "test",                      # Нет @
            "test@",                     # Нет домена
            "@test.com",                  # Нет локальной части
            "test@domain",                 # Нет точки в домене
            "test@.com",                   # Точка сразу после @
            "test@domain.",                 # Точка в конце
            ".test@domain.com",              # Точка в начале локальной части
            "test.@domain.com",               # Точка в конце локальной части
            "test@domain..com",                # Две точки в домене
            "test@.domain.com",                 # Точка после @
            "test@domain.com.",                  # Точка в конце
        ]
        
        for email in invalid_emails:
            self.assertFalse(self.validate_email_strict(email), 
                           f"Должно быть False: {email}")
        
        print(f"  {CHECK_MARK} Тест 4 пройден: невалидные email")
    
    def test_5_email_one_char_tld(self):
        """Тест 5: Email с односимвольным TLD (должны быть невалидными)"""
        one_char_emails = [
            "test@domain.c",    # .c - невалидный TLD
            "test@domain.x",     # .x - невалидный
            "test@domain.1",     # цифра в конце
            "test@domain.a",     # .a - невалидный
            "test@domain.z",     # .z - невалидный
        ]
        
        for email in one_char_emails:
            self.assertFalse(self.validate_email_strict(email), 
                           f"Должно быть False: {email}")
        
        print(f"  {CHECK_MARK} Тест 5 пройден: односимвольные TLD")
    
    def test_6_email_two_char_tld(self):
        """Тест 6: Email с двухсимвольным TLD (должны быть валидными)"""
        two_char_emails = [
            "test@domain.co",    # .co - валидный
            "test@domain.ru",    # .ru - валидный
            "test@domain.uk",    # .uk - валидный
            "test@domain.io",    # .io - валидный
            "test@domain.tv",    # .tv - валидный
            "test@domain.me",    # .me - валидный
        ]
        
        for email in two_char_emails:
            self.assertTrue(self.validate_email_strict(email), 
                          f"Должно быть True: {email}")
        
        print(f"  {CHECK_MARK} Тест 6 пройден: двухсимвольные TLD")
    
    def test_7_email_edge_cases(self):
        """Тест 7: Граничные случаи email"""
        test_cases = [
            ("test@domain.com", True),
            ("", False),
            ("test", False),
            ("test@", False),
            ("@domain.com", False),
            ("test@domain", False),
            ("test@.com", False),
            ("test@domain.", False),
            (".test@domain.com", False),
            ("test.@domain.com", False),
            ("test@domain..com", False),
            ("test@.domain.com", False),
            ("test@domain.com.", False),
            ("test@domain.c", False),
            ("test@domain.co", True),
            ("test@domain.ru", True),
            ("test@domain.io", True),
            ("test@domain.xyz", True),
            ("a@b.cd", True),
        ]
        
        for email, expected in test_cases:
            result = self.validate_email_strict(email)
            self.assertEqual(result, expected, f"Email: '{email}', ожидалось {expected}, получено {result}")
        
        print(f"  {CHECK_MARK} Тест 7 пройден: граничные случаи")

class TestEstimate(unittest.TestCase):
    """Тестирование заявок на оценку"""
    
    def setUp(self):
        self.estimate = {
            "name": "Иван Петров",
            "phone": "+79991234567",
            "model": "Airbus H130",
            "year": 2018,
            "hours": 1200
        }
    
    def test_1_estimate_structure(self):
        """Тест 1: Структура заявки"""
        required_fields = ['name', 'phone', 'model', 'year', 'hours']
        for field in required_fields:
            self.assertIn(field, self.estimate)
        print(f"  {CHECK_MARK} Тест 1 пройден: структура заявки")
    
    def test_2_estimate_values(self):
        """Тест 2: Значения заявки"""
        self.assertGreaterEqual(len(self.estimate['name']), 2)
        self.assertGreaterEqual(self.estimate['year'], 1900)
        self.assertLessEqual(self.estimate['year'], 2030)
        self.assertGreaterEqual(self.estimate['hours'], 0)
        print(f"  {CHECK_MARK} Тест 2 пройден: значения заявки")

def run_tests():
    """Запуск всех тестов с красивым выводом"""
    print(f"\n{'='*60}")
    print(f"{ROCKET_MARK} ЗАПУСК ТЕСТОВ SKYSWAG")
    print(f"{'='*60}\n")
    
    # Создаем тестовый набор
    suite = unittest.TestSuite()
    
    # Добавляем тесты
    suite.addTest(unittest.makeSuite(TestProducts))
    suite.addTest(unittest.makeSuite(TestFilters))
    suite.addTest(unittest.makeSuite(TestValidation))
    suite.addTest(unittest.makeSuite(TestEstimate))
    
    # Запускаем
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print(f"\n{'='*60}")
    if result.wasSuccessful():
        print(f"{CHECK_MARK} ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!")
        print(f"{'='*60}")
    else:
        print(f"{CROSS_MARK} ПРОЙДЕНО: {result.testsRun - len(result.failures) - len(result.errors)}/{result.testsRun}")
        print(f"{CROSS_MARK} ОШИБОК: {len(result.errors)}")
        print(f"{CROSS_MARK} ПАДЕНИЙ: {len(result.failures)}")
        print(f"{'='*60}")
    
    return result

if __name__ == '__main__':
    run_tests()