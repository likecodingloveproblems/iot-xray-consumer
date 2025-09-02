import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  Query,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { SignalsService } from './signals.service';
import { Signal } from './schemas/signal';
import { CreateSignalDto } from './signals.dto';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  async create(@Body() createSignalDto: CreateSignalDto): Promise<Signal> {
    return this.signalsService.create(createSignalDto)
  }

  @Get()
  async findAll(
    @Query('skip') skip = 0,
    @Query('limit') limit = 50,
  ): Promise<Signal[]> {
    return this.signalsService.findAll(Number(skip), Number(limit));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Signal> {
    const signal = await this.signalsService.findOne(id);
    if (signal === null) {
      throw new NotFoundException('Signal not found');
    }
    return signal;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
  ): Promise<Signal> {
    const signal = await this.signalsService.update(id, updateDto);
    if (signal === null) {
      throw new NotFoundException('Signal not found');
    }
    return signal;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const deleted = await this.signalsService.remove(id);
    if (!deleted) {
      throw new NotFoundException('Signal not found');
    }
  }
}
