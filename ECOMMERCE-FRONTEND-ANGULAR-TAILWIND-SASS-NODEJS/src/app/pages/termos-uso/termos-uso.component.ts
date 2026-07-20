import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-termos-uso',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './termos-uso.component.html',
  styleUrl: './termos-uso.component.scss',
})
export class TermosUsoComponent {
  fontesDasImagens = [
    { site: 'Minube', url: 'https://www.minube.com.br/sitio-preferido/rio-de-janeiro-a151' },
    { site: 'Jovem Pan', url: 'https://jovempan.com.br/edicase/aniversario-de-sao-paulo-10-curiosidades-sobre-a-cidade.html' },
    { site: 'Monitor do Mercado', url: 'https://monitordomercado.com.br/noticias/181772-por-que-recife-deveria-estar-no-topo-da-sua-lista-de-viagens/' },
    { site: 'Oliveira Imóveis AL', url: 'https://oliveiraimoveisal.com.br/postagem/maceio-alagoas' },
    { site: 'Gontijo (Facebook)', url: 'https://www.facebook.com/empresagontijooficial/' },
    { site: 'Brasil Infos (Gontijo)', url: 'https://belo-horizonte-mg.brasil-infos.com/empresa-gontijo-de-transportes-5/' },
    { site: 'Águia Branca', url: 'https://www.aguiabranca.com.br/marca' },
    { site: 'ClickBus (Ultra)', url: 'https://www.clickbus.com.br/viacao/ultra' },
    { site: 'Wikipedia (Cometa)', url: 'https://pt.wikipedia.org/wiki/Ficheiro:Logotipo_Cometa.png' },
    { site: 'Mala de Aventuras', url: 'https://www.maladeaventuras.com/melhores-praias-da-bahia/' },
    { site: 'Shutterstock', url: 'https://www.shutterstock.com/pt/search/beach-water-sky' },
    { site: 'Samaria', url: 'https://samaria.com.br/' },
    { site: '99Jobs (Jadlog)', url: 'https://99jobs.com/jadlog' },
    { site: 'Catarinense', url: 'https://www.catarinense.com.br/empresa' },
    { site: 'Viagem e Turismo', url: 'https://viagemeturismo.abril.com.br/cidades/ilha-comprida/' },
    { site: 'Elo7', url: 'https://www.elo7.com.br/frete-sedex-sp-capital/dp/E49C4A' },
    { site: 'Code Market', url: 'https://www.codemarket.com.br/produto/integracao-melhor-envio-oficial-correios-e-transportadoras' },
    { site: 'Pássaro Marron', url: 'https://www.passaromarron.com.br/' },
    { site: 'LogoDownload (Pássaro Marron)', url: 'https://logodownload.org/passaro-marron-logo/' },
    { site: 'Villa del Sol', url: 'https://villadelsol.com.br/blog/ferias-de-julho-em-paraty-estrela-tours/' },
    { site: 'IHG (InterContinental)', url: 'https://www.ihg.com/intercontinental/hotels/br/pt/sao-paulo/saoha/hoteldetail' },
    { site: 'Booking (Palácio Tangará)', url: 'https://www.booking.com/hotel/br/palacio-tangara.pt-br.html' },
    { site: 'Hoteis.com', url: 'https://www.hoteis.com' },
    { site: 'Marazul Receptivo', url: 'https://marazulreceptivo.com.br/blog/hoteis-all-inclusive-natal/' },
    { site: 'Canaltech (Loggi)', url: 'https://canaltech.com.br/mercado/o-que-e-e-como-funciona-a-loggi/' },
    { site: 'Magnific', url: 'https://www.magnific.com/br/fotos-gratis/entregador-feliz-carregando-pacotes-ao-fazer-entrega-em-domicilio-para-seu-cliente_25622123.htm' }
  ];
}