import sys

file = 'src/modules/Auth/pages/OnboardingSetup.jsx'
with open(file, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('\\`', '`')
text = text.replace('\\$', '$')

with open(file, 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed OnboardingSetup!")
