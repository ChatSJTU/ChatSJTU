import ahocorasick

# AC自动机快速查找敏感词
class SensitiveWord:
    def __init__(self, filename):
        self.filename = filename
        ac = ahocorasick.Automaton()
        with open(self.filename, 'r', encoding='UTF-8') as file:
            self.keyword_list = [line.strip() for line in file]
        for index, keyword in enumerate(self.keyword_list):
            ac.add_word(keyword, (index, keyword))
        ac.make_automaton() # 构建Aho-Corasick自动机, 用于快速查找敏感词
        self.ac = ac
        

    def find(self, text):
        # 从文本中找出敏感词 True: 有敏感词 False: 没有敏感词
        # text: 要检测的文本
        return len(list(self.ac.iter(text))) != 0
    
senword_detector = SensitiveWord('./chat/core/senwords/sen_wordlist.txt')
senword_detector_strict = SensitiveWord('./chat/core/senwords/sen_wordlist_strict.txt')