export const DashboardFooter = () => {
  return (
    <div className="mt-8 text-center text-sm text-muted-foreground">
      <p>© 2024 TRT15 - Núcleo de Apoio ao PJe | Ferramenta de apoio para abertura de issues JIRA</p>
      <p className="mt-1">
        Desenvolvido por{' '}
        <a 
          href="https://msribeiro2010.github.io/marcelo-s-ribeiro-stellar-ai/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          msribeiro
        </a>
      </p>
    </div>
  );
};