// ...existing code from script.js...

const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(button => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    if (answer.style.maxHeight) {
      // Close if open
      answer.style.maxHeight = null;
    } else {
      // Close any open answers
      document.querySelectorAll('.faq-answer').forEach(a => a.style.maxHeight = null);
      // Open clicked one
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});
