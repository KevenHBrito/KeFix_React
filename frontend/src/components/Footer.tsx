import { Link } from 'react-router-dom';
import { Smartphone, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-logo">Ke<span>Fix</span></div>
          <p>Distribuidora de peças para celular com qualidade garantida e entrega rápida.</p>
        </div>
        <div>
          <h4>Links Rápidos</h4>
          <ul>
            <li><Link to="/">Início</Link></li>
            <li><Link to="/busca">Buscar Produtos</Link></li>
            <li><Link to="/carrinho">Carrinho</Link></li>
            <li><Link to="/minha-conta">Minha Conta</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contato</h4>
          <ul>
            <li><Mail size={14} /> contato@kefix.com.br</li>
            <li><Phone size={14} /> (44) 99999-9999</li>
            <li><Smartphone size={14} /> WhatsApp disponível</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} KeFix Distribuidora. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
